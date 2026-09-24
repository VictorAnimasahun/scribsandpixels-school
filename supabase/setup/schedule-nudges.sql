-- Run once in the Supabase SQL editor, after deploying the send-nudges function.
-- Replace the two placeholders first. CRON_SECRET must match the function's secret.
-- (Not a migration: it holds project-specific secrets.)

create extension if not exists pg_cron;
create extension if not exists pg_net;

select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret('<CRON_SECRET>', 'nudges_cron_secret');

-- Every hour on the hour; the function picks learners whose local nudge hour it is.
select cron.schedule(
  'send-nudges',
  '0 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-nudges',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'nudges_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
