// End-to-end test of accounts and sync, in a real browser, against a local stand-in for Supabase
// built from real parts:
//   - Postgres: PGlite (in-process) with every migration in supabase/migrations applied
//   - the REST API: PostgREST, the server Supabase itself runs (downloaded once, cached)
//   - Auth: a small fake of Supabase Auth (GoTrue) below: email codes, magic links with PKCE,
//     sessions as JWTs that PostgREST verifies, so row level security sees the right learner
// The app runs from the Vite dev server with VITE_SUPABASE_URL pointed at that stand-in, and
// Chrome (playwright-core) uses it the way a learner would: types an email, reads the code
// "from the inbox", ticks blocks, goes offline, opens the app on a second device, signs out.
//
// Usage: npm run check:accounts            (HEADED=1 to watch, DEBUG=1 for server logs)
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'
import { spawn, execFileSync } from 'node:child_process'
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import { join } from 'node:path'
import pg from 'pg'
import { chromium } from 'playwright-core'
import { createServer as createVite } from 'vite'

const root = new URL('..', import.meta.url).pathname
const DEBUG = !!process.env.DEBUG
/** A port nothing is using right now (ask the OS for one). */
const freePort = () => new Promise((resolve) => {
  const probe = net.createServer().listen(0, '127.0.0.1', () => { const { port } = probe.address(); probe.close(() => resolve(port)) })
})
const [PG_PORT, REST_PORT, GATEWAY_PORT, APP_PORT] = [await freePort(), await freePort(), await freePort(), await freePort()]
const GATEWAY = `http://127.0.0.1:${GATEWAY_PORT}`
const APP = `http://localhost:${APP_PORT}/`
const SECRET = randomBytes(32).toString('hex')

// ─── Postgres (PGlite) ──────────────────────────────────────────────────────

const db = await PGlite.create()
// What Supabase provides around the migrations: roles, auth.users, auth.uid() (as Supabase
// defines it: the `sub` claim of the request's JWT, set by PostgREST).
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text not null unique, raw_user_meta_data jsonb not null default '{}');
  create function auth.uid() returns uuid language sql stable as $$
    select coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
`)
// Supabase's default privileges, set before the migrations so their REVOKEs take effect.
await db.exec(`
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`)
for (const file of readdirSync(join(root, 'supabase/migrations')).filter((f) => f.endsWith('.sql')).sort()) {
  await db.exec(readFileSync(join(root, 'supabase/migrations', file), 'utf8'))
}


// PGlite answers an error inside an extended-protocol batch with ErrorResponse *and* an early
// ReadyForQuery; real Postgres sends ReadyForQuery only at the batch's Sync and ignores the rest
// of the batch until then. PostgREST (libpq pipelining) treats the extra message as a broken
// connection, so behave like Postgres here.
{
  const original = db.execProtocolRawStream.bind(db)
  let skipUntilSync = false
  const concat = (parts) => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let i = 0; for (const p of parts) { out.set(p, i); i += p.length } return out }
  db.execProtocolRawStream = async (message, options) => {
    const type = String.fromCharCode(message[0])
    const extended = 'PBDEHC'.includes(type) && message.length >= 5
    if (type === 'S') { skipUntilSync = false; return original(message, options) }
    if (!extended) return original(message, options)
    if (skipUntilSync) return
    const chunks = []
    // Copy: PGlite passes a view into its WebAssembly memory, valid only during the callback.
    await original(message, { ...options, onRawData: (d) => chunks.push(d.slice()) })
    const all = concat(chunks)
    const keep = []
    let sawError = false
    for (let i = 0; i < all.length;) {
      const t = String.fromCharCode(all[i])
      const len = new DataView(all.buffer, all.byteOffset + i + 1, 4).getInt32(0)
      const msg = all.slice(i, i + 1 + len)
      if (t === 'E') sawError = true
      if (!(t === 'Z' && sawError)) keep.push(msg)
      i += 1 + len
    }
    if (sawError) skipUntilSync = true
    if (keep.length) options.onRawData(concat(keep))
  }
}

const socket = new PGLiteSocketServer({ db, port: PG_PORT, host: '127.0.0.1', maxConnections: 4 })
await socket.start()

// The test's own SQL goes through the socket too, as an ordinary Postgres client. PGlite is one
// session shared by every connection; the socket server keeps each connection's transaction
// together, so a test write can't land inside one of PostgREST's (read-only) transactions.
const client = new pg.Client({ host: '127.0.0.1', port: PG_PORT, user: 'postgres', database: 'postgres' })
await client.connect()

// ─── PostgREST ──────────────────────────────────────────────────────────────

async function postgrestBinary() {
  if (process.env.POSTGREST_BIN) return process.env.POSTGREST_BIN
  const version = 'v16.4'
  const asset = {
    'darwin-arm64': 'macos-aarch64', 'darwin-x64': 'macos-x86-64',
    'linux-x64': 'linux-static-x86-64', 'linux-arm64': 'linux-static-aarch64',
  }[`${process.platform}-${process.arch}`]
  if (!asset) throw new Error(`No PostgREST build for ${process.platform}-${process.arch}; set POSTGREST_BIN`)
  const dir = join(root, 'node_modules/.cache', `postgrest-${version}`)
  const bin = join(dir, 'postgrest')
  if (existsSync(bin)) {
    // A run killed mid-way can leave its PostgREST behind; stop it (only this cached binary).
    try { execFileSync('pkill', ['-f', bin]) } catch { /* none running */ }
    return bin
  }
  mkdirSync(dir, { recursive: true })
  const url = `https://github.com/PostgREST/postgrest/releases/download/${version}/postgrest-${version}-${asset}.tar.xz`
  console.log(`Downloading PostgREST ${version} (${asset})…`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`)
  writeFileSync(join(dir, 'postgrest.tar.xz'), Buffer.from(await res.arrayBuffer()))
  execFileSync('tar', ['xf', 'postgrest.tar.xz'], { cwd: dir })
  return bin
}

const postgrest = spawn(await postgrestBinary(), [], {
  env: {
    ...process.env,
    PGRST_DB_URI: `postgres://postgres@127.0.0.1:${PG_PORT}/postgres`,
    PGRST_DB_SCHEMAS: 'public',
    PGRST_DB_ANON_ROLE: 'anon',
    PGRST_JWT_SECRET: SECRET,
    PGRST_SERVER_PORT: String(REST_PORT),
    PGRST_SERVER_HOST: '127.0.0.1',
    PGRST_DB_POOL: '1',
    PGRST_DB_CHANNEL_ENABLED: 'false',
    PGRST_DB_PREPARED_STATEMENTS: 'false', // PGlite is one session shared by every connection
    PGRST_DB_MAX_ROWS: '1000', // Supabase's default page limit, so paging is tested for real
    PGRST_LOG_LEVEL: DEBUG ? 'info' : 'crit',
  },
})
// Never leave PostgREST running (it would hold the port for the next run), even after a crash.
const stopPostgrest = () => { try { postgrest.kill() } catch { /* already gone */ } }
process.on('exit', stopPostgrest)
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGPIPE']) process.on(signal, () => { stopPostgrest(); process.exit(130) })
process.on('uncaughtException', (e) => { console.error(e); stopPostgrest(); process.exit(1) })
process.on('unhandledRejection', (e) => { console.error(e); stopPostgrest(); process.exit(1) })
postgrest.stdout.on('data', (d) => DEBUG && process.stdout.write(`[postgrest] ${d}`))
postgrest.stderr.on('data', (d) => DEBUG && process.stdout.write(`[postgrest] ${d}`))
for (let i = 0; ; i++) {
  try { if ((await fetch(`http://127.0.0.1:${REST_PORT}/`)).ok) break } catch { /* not up yet */ }
  if (i > 100) throw new Error('PostgREST did not start')
  await new Promise((r) => setTimeout(r, 100))
}

// ─── Fake Supabase Auth + the gateway in front of everything ────────────────

const b64url = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url')
function jwt(claims) {
  const head = b64url({ alg: 'HS256', typ: 'JWT' }), body = b64url(claims)
  return `${head}.${body}.${createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url')}`
}
function claimsOf(token) {
  const [head, body, sig] = (token ?? '').split('.')
  if (!sig || createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url') !== sig) return null
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString())
  return claims.exp > Date.now() / 1000 ? claims : null
}
const ANON_KEY = jwt({ role: 'anon', iss: 'supabase', exp: Math.floor(Date.now() / 1000) + 86_400 })

const users = new Map() // email → user
const mail = new Map() // email → { code, link, challenge, redirect }
const authCodes = new Map() // PKCE auth code → { email, challenge }
const refreshTokens = new Map() // refresh token → email
const authLog = []

async function userFor(email, create) {
  if (users.has(email)) return users.get(email)
  if (!create) return null
  const user = { id: randomUUID(), aud: 'authenticated', role: 'authenticated', email, app_metadata: { provider: 'email' }, user_metadata: {}, created_at: new Date().toISOString() }
  await client.query('insert into auth.users (id, email) values ($1, $2)', [user.id, email]) // the signup trigger makes the profile
  users.set(email, user)
  return user
}
function session(user) {
  const expiresIn = 3600, now = Math.floor(Date.now() / 1000)
  const refresh = randomBytes(16).toString('hex')
  refreshTokens.set(refresh, user.email)
  return {
    access_token: jwt({ sub: user.id, role: 'authenticated', aud: 'authenticated', email: user.email, exp: now + expiresIn, session_id: randomUUID() }),
    token_type: 'bearer', expires_in: expiresIn, expires_at: now + expiresIn, refresh_token: refresh, user,
  }
}
const s256 = (verifier) => createHash('sha256').update(verifier).digest('base64url')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, prefer, accept-profile, content-profile, range, range-unit, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD',
  'Access-Control-Expose-Headers': 'content-range, range, x-supabase-api-version',
}
let offline = false // when true the gateway refuses everything, like a dropped connection

const gateway = http.createServer(async (req, res) => {
  const url = new URL(req.url, GATEWAY)
  const chunks = []
  for await (const c of req) chunks.push(c)
  const raw = Buffer.concat(chunks)
  const send = (status, body, headers = {}) => {
    res.writeHead(status, { ...CORS, 'Content-Type': 'application/json', ...headers })
    res.end(body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body))
  }
  if (req.method === 'OPTIONS') return send(204)
  if (url.pathname.startsWith('/__test/')) {
    if (url.pathname === '/__test/mail') return send(200, mail.get(url.searchParams.get('email')) ?? null)
    return send(404, {})
  }
  if (offline) { req.socket.destroy(); return }

  // REST: pass through to PostgREST (it checks the JWT and sets the role and claims).
  if (url.pathname.startsWith('/rest/v1/')) {
    const headers = { ...req.headers }
    delete headers.host
    delete headers['content-length']
    if (!headers.authorization) headers.authorization = `Bearer ${ANON_KEY}`
    const upstream = await fetch(`http://127.0.0.1:${REST_PORT}${url.pathname.slice('/rest/v1'.length)}${url.search}`, {
      method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : raw,
    })
    const out = Buffer.from(await upstream.arrayBuffer())
    const keep = {}
    for (const h of ['content-type', 'content-range', 'preference-applied']) if (upstream.headers.get(h)) keep[h] = upstream.headers.get(h)
    res.writeHead(upstream.status, { ...CORS, ...keep })
    return res.end(out)
  }

  // Auth (the parts supabase-js uses here).
  if (url.pathname.startsWith('/auth/v1/')) {
    const path = url.pathname.slice('/auth/v1'.length)
    const body = raw.length ? JSON.parse(raw.toString()) : {}
    authLog.push(`${req.method} ${path}`)
    const bearer = (req.headers.authorization ?? '').replace(/^Bearer /, '')
    if (req.method === 'POST' && path === '/otp') {
      const email = String(body.email ?? '').toLowerCase()
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return send(400, { code: 400, error_code: 'validation_failed', msg: 'Unable to validate email address: invalid format' })
      await userFor(email, body.create_user !== false)
      const code = String(Math.floor(100000 + Math.random() * 900000))
      const linkToken = randomBytes(12).toString('hex')
      const redirect = url.searchParams.get('redirect_to') ?? APP
      mail.set(email, { code, linkToken, challenge: body.code_challenge ?? null, redirect, link: `${GATEWAY}/auth/v1/verify?token=${linkToken}&type=magiclink&redirect_to=${encodeURIComponent(redirect)}` })
      return send(200, {})
    }
    if (req.method === 'POST' && path === '/verify') {
      const email = String(body.email ?? '').toLowerCase()
      const sent = mail.get(email)
      if (!sent || body.token !== sent.code) return send(403, { code: 403, error_code: 'otp_expired', msg: 'Token has expired or is invalid' })
      mail.delete(email) // a code works once
      return send(200, session(await userFor(email, false)))
    }
    if (req.method === 'GET' && path === '/verify') {
      // The magic link: with PKCE it sends the browser back with ?code=, swapped later for a session.
      const entry = [...mail.entries()].find(([, m]) => m.linkToken === url.searchParams.get('token'))
      const redirect = url.searchParams.get('redirect_to') ?? APP
      if (!entry) return send(303, '', { Location: `${redirect}?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired` })
      const [email, m] = entry
      mail.delete(email)
      const authCode = randomUUID()
      authCodes.set(authCode, { email, challenge: m.challenge })
      return send(303, '', { Location: `${redirect}?code=${authCode}` })
    }
    if (req.method === 'POST' && path === '/token') {
      const grant = url.searchParams.get('grant_type')
      if (grant === 'pkce') {
        const pending = authCodes.get(body.auth_code)
        authCodes.delete(body.auth_code)
        if (!pending || !body.code_verifier || s256(body.code_verifier) !== pending.challenge) {
          return send(400, { code: 400, error_code: 'bad_code_verifier', msg: 'code challenge does not match previously saved code verifier' })
        }
        return send(200, session(await userFor(pending.email, false)))
      }
      if (grant === 'refresh_token') {
        const email = refreshTokens.get(body.refresh_token)
        if (!email) return send(400, { code: 400, error_code: 'refresh_token_not_found', msg: 'Invalid Refresh Token: Refresh Token Not Found' })
        refreshTokens.delete(body.refresh_token)
        return send(200, session(users.get(email)))
      }
      return send(400, { msg: `unsupported grant ${grant}` })
    }
    if (req.method === 'GET' && path === '/user') {
      const claims = claimsOf(bearer)
      const user = claims && [...users.values()].find((u) => u.id === claims.sub)
      return user ? send(200, user) : send(401, { code: 401, error_code: 'bad_jwt', msg: 'invalid JWT' })
    }
    if (req.method === 'POST' && path === '/logout') return send(204)
    return send(404, { msg: `fake auth: ${req.method} ${path} not implemented` })
  }
  send(404, {})
})
await new Promise((r) => gateway.listen(GATEWAY_PORT, '127.0.0.1', r))

// ─── The app (Vite dev server, pointed at the stand-in) ─────────────────────

process.env.VITE_SUPABASE_URL = GATEWAY
process.env.VITE_SUPABASE_KEY = ANON_KEY
const vite = await createVite({ root, server: { port: APP_PORT, strictPort: true }, logLevel: DEBUG ? 'info' : 'error', clearScreen: false })
await vite.listen()

// ─── Helpers ────────────────────────────────────────────────────────────────

const chrome = process.env.CHROME_PATH ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(existsSync)
const browser = await chromium.launch({ executablePath: chrome, headless: !process.env.HEADED })
let failures = 0
const pageErrors = []
const ok = (name) => console.log(`✓ ${name}`)
const fail = (name, detail) => { failures++; console.log(`✗ ${name}${detail ? `\n    ${detail}` : ''}`) }
async function check(name, fn) {
  try { await fn(); ok(name) } catch (e) { fail(name, e.message.split('\n').slice(0, 4).join('\n    ')) }
}
const expect = (cond, message) => { if (!cond) throw new Error(message) }
const sql = async (q, params = []) => (await client.query(q, params)).rows
/** Poll until fn() returns something truthy (the app saves a moment after each change). */
async function eventually(what, fn, timeout = 15_000) {
  const until = Date.now() + timeout
  let last
  for (;;) {
    last = await fn()
    if (last) return last
    if (Date.now() > until) throw new Error(`timed out waiting for: ${what}`)
    await new Promise((r) => setTimeout(r, 200))
  }
}
/** The save line on the Account page (the sidebar repeats it, so target the status itself). */
const saveLine = (page) => page.locator('p.status[role="status"]')

async function device(label) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  page.on('pageerror', (e) => pageErrors.push(`${label}: ${e.message}`))
  page.on('dialog', (d) => d.accept())
  if (DEBUG) page.on('console', (m) => console.log(`  [${label}] ${m.type()}: ${m.text().slice(0, 200)}`))
  return { label, context, page }
}
/** Week 1's random checkpoints, already passed, so they don't lock the pages these tests tick. */
async function passWeekOneCheckpoints(page) {
  await page.goto(APP)
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('snp-test-state-v1') ?? '{}')
    s.gates = s.gates ?? {}
    for (let d = 1; d <= 6; d++) s.gates[`fullstack-ml:1:${d}`] = { triggeredAt: Date.now() - 3_600_000, attempts: [{ finishedAt: Date.now() - 3_000_000, passed: true, score: 1 }], seen: [] }
    localStorage.setItem('snp-test-state-v1', JSON.stringify(s))
  })
  await page.reload()
}
const localState = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('snp-test-state-v1') ?? '{}'))
const syncMeta = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('snp-sync-v1') ?? 'null'))
/** Wait until everything in this browser is on the server (sync base = local state). */
async function waitSaved(page, timeout = 15_000) {
  await eventually('this browser to finish saving', () => page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('snp-test-state-v1') ?? '{}')
    const meta = JSON.parse(localStorage.getItem('snp-sync-v1') ?? 'null')
    const keys = (o) => JSON.stringify(Object.keys(o ?? {}).sort())
    return !!meta && keys(meta.base.checked) === keys(state.checked) && keys(meta.base.gates) === keys(state.gates)
  }), timeout)
}
async function signIn(page, email) {
  await page.goto(`${APP}#/account`)
  await page.getByRole('heading', { name: 'Sign in' }).waitFor({ timeout: 20_000 })
  await page.getByLabel('Email').fill(email)
  await page.getByRole('button', { name: 'Email me a sign-in code' }).click()
  await page.getByText('We sent a code to').waitFor()
  const sent = await (await fetch(`${GATEWAY}/__test/mail?email=${encodeURIComponent(email)}`)).json()
  expect(sent?.code, 'no code was "emailed"')
  await page.getByLabel('Code from the email').fill(sent.code)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('heading', { name: 'Your account' }).waitFor({ timeout: 20_000 })
  await saveLine(page).getByText(/Saved to your account/).waitFor({ timeout: 20_000 })
}
/** Tick every block of a day, the way a learner does. */
async function tickDay(page, week, day) {
  await page.goto(`${APP}#/c/fullstack-ml/w/${week}/d/${day}`)
  await page.locator('button.tick').first().waitFor()
  for (;;) {
    const open = page.locator('button.tick[aria-pressed="false"]')
    if (!(await open.count())) break
    await open.first().click()
  }
}
const ticked = (state, prefix) => Object.keys(state.checked ?? {}).filter((k) => k.startsWith(prefix)).sort()

// ─── Scenarios ──────────────────────────────────────────────────────────────

const VICTOR = 'victor@example.com'
const laptop = await device('laptop')
const phone = await device('phone')
await passWeekOneCheckpoints(laptop.page)

// 1. Using the school before having an account, then signing in.
await tickDay(laptop.page, 1, 1)
await laptop.page.goto(`${APP}#/c/fullstack-ml/w/1/d/2`)
await laptop.page.locator('button.tick').first().click() // one block of Day 2
const before = await localState(laptop.page)
await check('before signing in, the Account page offers sign-in and says progress will move over', async () => {
  await laptop.page.goto(`${APP}#/account`)
  await laptop.page.getByText("What you've done in this browser so far moves into your account").waitFor()
})
await check('signing in with the emailed code works', () => signIn(laptop.page, VICTOR))
const victorId = users.get(VICTOR)?.id
await check('the progress made before signing in is now in the account', async () => {
  const blocks = await sql('select course_slug, week, day, block_key from block_progress where user_id = $1', [victorId])
  const local = ticked(before, 'fullstack-ml:')
  expect(blocks.length === local.length, `${blocks.length} rows saved for ${local.length} ticks`)
  const days = await sql('select week, day from day_progress where user_id = $1', [victorId])
  expect(days.length === 1 && days[0].week === 1 && days[0].day === 1, `day_progress: ${JSON.stringify(days)}`)
  const studied = await sql('select studied_on from study_days where user_id = $1', [victorId])
  expect(studied.length === 1, `study_days: ${JSON.stringify(studied)}`)
  const [profile] = await sql('select app_state, timezone from profiles where id = $1', [victorId])
  expect(profile.app_state.activeCourse === 'fullstack-ml', `app_state: ${JSON.stringify(profile.app_state)}`)
})
await check('the checkpoint schedule now follows the account (same days on every device)', async () => {
  expect((await localState(laptop.page)).learnerId === victorId, 'learnerId is not the account id')
})
await check('the sidebar/tab says progress is saved to the account', async () => {
  await laptop.page.setViewportSize({ width: 1200, height: 800 })
  await laptop.page.goto(APP)
  await laptop.page.getByText('Progress is saved to your account.').waitFor()
  await laptop.page.setViewportSize({ width: 390, height: 844 })
})

// 2. A second device.
await check('signing in on a second device brings the progress there', async () => {
  await signIn(phone.page, VICTOR)
  const state = await localState(phone.page)
  expect(JSON.stringify(ticked(state, 'fullstack-ml:')) === JSON.stringify(ticked(before, 'fullstack-ml:')), `phone has ${ticked(state, 'fullstack-ml:').length} ticks, laptop had ${ticked(before, 'fullstack-ml:').length}`)
})

// 3. Changes on one device reach the other, including unticks.
await check('an untick on the phone reaches the server and then the laptop', async () => {
  await phone.page.goto(`${APP}#/c/fullstack-ml/w/1/d/2`)
  await phone.page.locator('button.tick[aria-pressed="true"]').first().click()
  await eventually('the untick to reach the server', async () => (await sql('select 1 from block_progress where user_id = $1 and week = 1 and day = 2', [victorId])).length === 0)
  await laptop.page.goto(`${APP}#/account`)
  await laptop.page.getByRole('button', { name: 'Download from my account now' }).click()
  await laptop.page.waitForFunction(() => !Object.keys(JSON.parse(localStorage.getItem('snp-test-state-v1')).checked).some((k) => k.startsWith('fullstack-ml:1:2:')), null, { timeout: 10_000 })
})
await check('a whole day ticked on the laptop arrives on the phone when it comes back into view', async () => {
  await tickDay(laptop.page, 1, 2)
  await waitSaved(laptop.page)
  await phone.page.goto(`${APP}#/account`)
  // Simulate switching back to the tab (the app downloads on visibilitychange; throttle is 30 s).
  await phone.page.getByRole('button', { name: 'Download from my account now' }).click()
  await phone.page.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem('snp-test-state-v1')).checked).filter((k) => k.startsWith('fullstack-ml:1:2:')).length > 1, null, { timeout: 10_000 })
})

// 4. Offline.
await check('ticks made offline are kept, and saved when the connection is back', async () => {
  try {
    offline = true
    await tickDay(laptop.page, 1, 3)
    await laptop.page.goto(`${APP}#/account`)
    await saveLine(laptop.page).getByText(/Offline: saving when|Not saved yet/).waitFor({ timeout: 15_000 })
    const during = await sql('select 1 from block_progress where user_id = $1 and week = 1 and day = 3', [victorId])
    expect(during.length === 0, 'rows arrived while offline?')
    const kept = ticked(await localState(laptop.page), 'fullstack-ml:1:3:')
    expect(kept.length > 1, 'the offline ticks are not kept in the browser')
  } finally {
    offline = false
  }
  await laptop.page.evaluate(() => window.dispatchEvent(new Event('online')))
  await eventually('Day 3 to be saved after reconnecting', async () => (await sql('select 1 from day_progress where user_id = $1 and week = 1 and day = 3', [victorId])).length === 1, 20_000)
  await saveLine(laptop.page).getByText(/Saved to your account/).waitFor({ timeout: 20_000 })
})

// 5. Checkpoints: permanent on the server, whatever the browser says.
await check("a checkpoint attempt is saved the moment it starts, and its result can't be faked later", async () => {
  // A checkpoint pops up: the app records it exactly like this when a learner opens a random
  // checkpoint day (students have no tester tools to force one).
  await laptop.page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('snp-test-state-v1'))
    s.gates['fullstack-ml:2:1'] = { triggeredAt: Date.now(), attempts: [], seen: [] }
    localStorage.setItem('snp-test-state-v1', JSON.stringify(s))
  })
  await laptop.page.goto(`${APP}#/c/fullstack-ml/w/2/d/1`)
  await laptop.page.reload()
  await laptop.page.getByRole('button', { name: /Start the checkpoint/ }).click()
  await laptop.page.waitForFunction(() => !!document.querySelector('.lock-card'), null, { timeout: 10_000 })
  // Saved as a provisional fail right away.
  await eventually('the started attempt to reach the server', async () => (await sql("select 1 from checkpoint_attempts where user_id = $1 and kind = 'gate' and key = 'fullstack-ml:2:1'", [victorId])).length > 0)
  const [started] = await sql("select passed, score from checkpoint_attempts where user_id = $1 and key = 'fullstack-ml:2:1'", [victorId])
  expect(started && started.passed === false && started.score === 0, `provisional attempt: ${JSON.stringify(started)}`)
  // Leave mid-quiz, then fake a pass by editing localStorage directly.
  await laptop.page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('snp-test-state-v1'))
    s.gates['fullstack-ml:2:1'].attempts[0] = { finishedAt: Date.now(), passed: true, score: 1 }
    localStorage.setItem('snp-test-state-v1', JSON.stringify(s))
  })
  await laptop.page.reload()
  await laptop.page.waitForTimeout(3000)
  const [after] = await sql("select passed, score from checkpoint_attempts where user_id = $1 and key = 'fullstack-ml:2:1'", [victorId])
  // Rewriting a provisional 0% into a pass is the one change the server can't tell from a real
  // finish (the browser grades the quiz). What matters: once a result is final it can't change.
  expect(after, 'attempt vanished')
  const tamper = await laptop.page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('snp-test-state-v1'))
    s.gates['fullstack-ml:2:1'].attempts[0] = { finishedAt: Date.now(), passed: false, score: 0.2 }
    localStorage.setItem('snp-test-state-v1', JSON.stringify(s))
    return true
  })
  expect(tamper, 'could not edit storage')
  await laptop.page.reload()
  await laptop.page.waitForTimeout(3000)
  const [final] = await sql("select passed, score from checkpoint_attempts where user_id = $1 and key = 'fullstack-ml:2:1'", [victorId])
  expect(final.passed === after.passed && final.score === after.score, `a final result changed on the server: ${JSON.stringify(after)} → ${JSON.stringify(final)}`)
  const local = (await localState(laptop.page)).gates['fullstack-ml:2:1'].attempts[0]
  expect(local.passed === final.passed && local.score === final.score, `the browser kept the tampered result: ${JSON.stringify(local)} vs server ${JSON.stringify(final)}`)
})

// 6. Magic links.
await check('the sign-in link works on the device that asked for it', async () => {
  const d = await device('tablet')
  await d.page.goto(`${APP}#/account`)
  await d.page.getByLabel('Email').fill(VICTOR)
  await d.page.getByRole('button', { name: 'Email me a sign-in code' }).click()
  await d.page.getByText('We sent a code to').waitFor()
  const { link } = await (await fetch(`${GATEWAY}/__test/mail?email=${encodeURIComponent(VICTOR)}`)).json()
  await d.page.goto(link)
  await d.page.getByRole('heading', { name: 'Your account' }).waitFor({ timeout: 20_000 })
  expect(!new URL(d.page.url()).search, `the code is still in the address bar: ${d.page.url()}`)
  await d.context.close()
})
await check('a sign-in link opened on another device explains to use the code instead', async () => {
  const asker = await device('asker'), other = await device('other')
  await asker.page.goto(`${APP}#/account`)
  await asker.page.getByLabel('Email').fill(VICTOR)
  await asker.page.getByRole('button', { name: 'Email me a sign-in code' }).click()
  await asker.page.getByText('We sent a code to').waitFor()
  const { link } = await (await fetch(`${GATEWAY}/__test/mail?email=${encodeURIComponent(VICTOR)}`)).json()
  await other.page.goto(link)
  await other.page.getByText(/opened in a different browser or device/).waitFor({ timeout: 20_000 })
  await asker.context.close(); await other.context.close()
})
await check('an expired or used link says so', async () => {
  const d = await device('late')
  await d.page.goto(`${GATEWAY}/auth/v1/verify?token=nope&type=magiclink&redirect_to=${encodeURIComponent(APP)}`)
  await d.page.getByText(/expired or was already used/).waitFor({ timeout: 20_000 })
  await d.context.close()
})
await check('a wrong code is refused with a clear message', async () => {
  const d = await device('typo')
  await d.page.goto(`${APP}#/account`)
  await d.page.getByLabel('Email').fill('typo@example.com')
  await d.page.getByRole('button', { name: 'Email me a sign-in code' }).click()
  await d.page.getByLabel('Code from the email').fill('000000')
  await d.page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await d.page.getByText(/That code is wrong or has expired/).waitFor()
  await d.context.close()
})

// 7. Another learner.
await check("a second learner starts empty and can't see the first learner's progress", async () => {
  const d = await device('ada')
  await signIn(d.page, 'ada@example.com')
  const state = await localState(d.page)
  expect(Object.keys(state.checked).length === 0, `ada sees ${Object.keys(state.checked).length} ticks`)
  const adaId = users.get('ada@example.com').id
  const leaked = await sql('select count(*)::int as n from block_progress where user_id = $1', [adaId])
  expect(leaked[0].n === 0, 'rows were written to ada')
  await d.context.close()
})

// 8. Big accounts: more rows than one API response holds.
await check('an account with more than 1,000 ticks downloads all of them (paged)', async () => {
  const email = 'busy@example.com'
  const user = await userFor(email, true)
  await client.query(`insert into block_progress (user_id, course_slug, week, day, block_key)
    select $1, 'fullstack-ml', w, d, b from generate_series(1, 50) w, generate_series(1, 6) d, unnest(array['review', 'lesson', 'practice', 'mini-task']) b`, [user.id])
  const dev = await device('busy')
  await signIn(dev.page, email)
  const n = Object.keys((await localState(dev.page)).checked).length
  expect(n === 1200, `downloaded ${n} of 1200 ticks`)
  await dev.context.close()
})

// 9. Student details and the admin page.
await check('a learner can save their name, time zone and nudge settings', async () => {
  await laptop.page.goto(`${APP}#/account`)
  await laptop.page.getByRole('heading', { name: 'Your details' }).waitFor()
  await laptop.page.getByLabel('Name (used in your emails)').fill('Victor')
  await laptop.page.getByLabel(/Time zone/).selectOption('America/Toronto')
  await laptop.page.getByLabel('Nudge time').selectOption('20')
  await laptop.page.getByRole('button', { name: 'Save details' }).click()
  await laptop.page.locator('.status.ok', { hasText: /^Saved$/ }).waitFor()
  const [p] = await sql('select display_name, timezone, nudge_hour, email_nudges from profiles where id = $1', [victorId])
  expect(p.display_name === 'Victor' && p.timezone === 'America/Toronto' && p.nudge_hour === 20 && p.email_nudges === true, JSON.stringify(p))
})
await check('the account page shows progress (study days per course and the streak)', async () => {
  await laptop.page.goto(`${APP}#/account`)
  await laptop.page.getByRole('heading', { name: 'Your progress' }).waitFor()
  await laptop.page.getByText(/12-Month Fullstack \+ ML: \d+ of \d+ written days done/).waitFor()
})
await check('a student gets "admins only" on the admin page, and no admin link', async () => {
  await laptop.page.goto(`${APP}#/admin`)
  await laptop.page.getByText('Your account is a student account.').waitFor()
  await laptop.page.goto(`${APP}#/account`)
  expect(!(await laptop.page.getByRole('link', { name: 'See all learners' }).count()), 'a student is offered the admin page')
})
await check('a signed-in student has no tester tools (they could force a checkpoint on a real account)', async () => {
  await laptop.page.goto(APP)
  await laptop.page.locator('main h1').first().waitFor()
  expect(!(await laptop.page.locator('.tester').count()), 'the 🧪 panel is shown to a student')
})
await check("an admin sees every learner, and the admin's own progress stays their own", async () => {
  const mineBefore = Object.keys((await localState(laptop.page)).checked).length
  await client.query("update public.profiles set role = 'admin' where id = $1", [victorId]) // what make-admin.sql does
  await laptop.page.goto(`${APP}#/account`)
  await laptop.page.getByRole('button', { name: 'Download from my account now' }).click()
  await laptop.page.getByRole('link', { name: 'See all learners' }).click()
  await laptop.page.getByRole('heading', { name: 'Learners' }).waitFor()
  const cards = laptop.page.locator('.learner-card')
  await cards.first().waitFor()
  const n = await cards.count()
  const accounts = (await sql('select count(*)::int as n from profiles'))[0].n
  expect(n === accounts, `${n} cards for ${accounts} accounts`)
  // Victor has finished days in Fullstack; busy@ has ticks but no finished day.
  await laptop.page.locator('.learner-card', { hasText: 'victor@example.com' }).getByText(/12-Month Fullstack \+ ML: \d+ days done/).waitFor()
  await laptop.page.locator('.learner-card', { hasText: 'busy@example.com' }).getByText('No finished days yet.').waitFor()
  expect(await laptop.page.locator('.tester').count() === 1, 'the admin lost the tester tools')
  // The bug this guards against: admin read access must never pull other learners' ticks in.
  await laptop.page.goto(`${APP}#/account`)
  await laptop.page.getByRole('button', { name: 'Download from my account now' }).click()
  await waitSaved(laptop.page)
  const mineAfter = Object.keys((await localState(laptop.page)).checked).length
  expect(mineAfter === mineBefore, `admin's ticks went from ${mineBefore} to ${mineAfter} (other learners' rows leaked in?)`)
  const serverMine = (await sql('select count(*)::int as n from block_progress where user_id = $1', [victorId]))[0].n
  expect(serverMine === mineBefore, `admin has ${serverMine} rows on the server, ${mineBefore} in the browser`)
})

await check('signing in on another device keeps a time zone the learner chose', async () => {
  const d = await device('travel')
  await signIn(d.page, VICTOR)
  const [p] = await sql('select timezone from profiles where id = $1', [victorId])
  expect(p.timezone === 'America/Toronto', `time zone reset to ${p.timezone}`)
  await d.context.close()
})

// 10. Signing out.
await check('signing out clears this browser but keeps the account', async () => {
  const rowsBefore = (await sql('select count(*)::int as n from block_progress where user_id = $1', [victorId]))[0].n
  await laptop.page.goto(`${APP}#/account`)
  await laptop.page.getByRole('button', { name: 'Sign out' }).click()
  await laptop.page.waitForURL(/#\/$/)
  const state = await localState(laptop.page)
  expect(Object.keys(state.checked ?? {}).length === 0, 'ticks left in the browser')
  expect((await syncMeta(laptop.page)) === null, 'sync data left in the browser')
  const session = await laptop.page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token')))
  expect(session.length === 0, 'session left in the browser')
  const rowsAfter = (await sql('select count(*)::int as n from block_progress where user_id = $1', [victorId]))[0].n
  expect(rowsAfter === rowsBefore, `account lost rows: ${rowsBefore} → ${rowsAfter}`)
})
await check('signing out with unsaved changes asks first', async () => {
  try {
    offline = true
    await tickDay(phone.page, 1, 4)
    await phone.page.goto(`${APP}#/account`)
    await phone.page.getByRole('button', { name: 'Sign out' }).click()
    await phone.page.getByText(/hasn't reached your account yet/).waitFor({ timeout: 20_000 })
    await phone.page.getByRole('button', { name: 'Stay signed in' }).click()
  } finally {
    offline = false
  }
  await phone.page.evaluate(() => window.dispatchEvent(new Event('online')))
  await eventually('Day 4 to be saved', async () => (await sql('select 1 from day_progress where user_id = $1 and week = 1 and day = 4', [victorId])).length === 1, 20_000)
})

await check('no JavaScript errors on any device', async () => {
  expect(!pageErrors.length, pageErrors.slice(0, 5).join('\n'))
})

console.log(failures ? `\n${failures} account check(s) failing` : '\nAll account checks pass')
if (DEBUG) console.log('auth calls:', authLog.join(', '))
await browser.close()
await client.end()
await vite.close()
gateway.close()
postgrest.kill()
await socket.stop()
process.exit(failures ? 1 : 0)
