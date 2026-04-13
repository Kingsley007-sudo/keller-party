# Keller Party

Next.js foundation for the Keller Party invitation experience.

## Scripts
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run check:supabase`
- `npm run generate:session-secret`

## Current scope
- Next.js app router setup
- App entry files
- Base landing page shell
- Discover documentation in `__Discover__/`
- Request-access form with persisted submissions
- Password-gated admin review page
- Supabase database storage for registrations
- Admin search, status filters, CSV export, and manual WhatsApp action
- Duplicate protection by phone number and Instagram name
- Privacy notice on registration submission

## Next implementation steps
- Deploy to Vercel or another persistent Node hosting target
- Add production environment variables to the hosting provider
- Test production registration, admin login, status update, WhatsApp link, and CSV export
- Add a fuller privacy/legal page if the event link will be shared broadly

## Environment
- `ADMIN_PASSWORD`: admin login password. Defaults to `keller-party-admin` in local development if unset.
- `SESSION_SECRET`: long random string used to sign admin session cookies. Falls back to `ADMIN_PASSWORD` if unset.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key used only on the server.

## Supabase setup
1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run the SQL in `supabase/schema.sql`.
4. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `SESSION_SECRET` to `.env.local`.
5. Run `npm run check:supabase`.
6. Restart the app server.

## Deployment checklist
1. Push the latest `dev` branch to GitHub.
2. Connect the repository to Vercel.
3. Add `ADMIN_PASSWORD`, `SESSION_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables.
4. Run `supabase/schema.sql` in the production Supabase project after every schema change.
5. Deploy and test `/request-access` and `/admin`.
6. Download a CSV export and keep it outside the repository.
