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

## Next implementation steps
- Configure `ADMIN_PASSWORD` before deployment
- Create the Supabase `registrations` table using `supabase/schema.sql`
- Search and filter controls in the admin area
- Manual WhatsApp action/link for accepted guests

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
