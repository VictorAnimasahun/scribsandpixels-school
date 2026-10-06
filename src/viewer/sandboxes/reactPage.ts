/*
 * React sandboxes: the learner writes JSX (and may write Vite-style imports), which is compiled
 * here with Sucrase and run in the preview with React 18 from a CDN. scripts/check-web-sandboxes.mjs
 * mirrors this so CI proves the tasks the same way.
 */
import { transform } from 'sucrase'

const CDN = 'https://cdnjs.cloudflare.com/ajax/libs'
/** Development builds: they warn about missing keys and other mistakes learners should see. */
export const REACT_SCRIPTS =
  `<script src="${CDN}/react/18.3.1/umd/react.development.js"></script>` +
  `<script src="${CDN}/react-dom/18.3.1/umd/react-dom.development.js"></script>`

/** `import { useState } from "react"` becomes require("react"), served from the page's globals. */
const MODULE_SHIM = `var exports = {}, module = { exports: exports };
function require(name) {
  if (name === 'react') return React;
  if (name === 'react-dom' || name === 'react-dom/client') return ReactDOM;
  throw new Error('Only "react" and "react-dom/client" can be imported here (got "' + name + '")');
}
`

/** Compile the JS tab. A syntax error becomes a console error in the preview, with the line. */
export function compileReact(source: string): string {
  try {
    const { code } = transform(source, { transforms: ['jsx', 'imports'], jsxRuntime: 'classic', production: false })
    return MODULE_SHIM + code
  } catch (error) {
    return `console.error(${JSON.stringify(`JSX error: ${(error as Error).message}`)})`
  }
}
