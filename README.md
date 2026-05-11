# Keller Party

Next.js foundation for the Keller Party invitation experience, prepared for Firebase App Hosting.

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
- Request-access form with persisted submissions
- Password-gated admin review page
- Supabase database storage for registrations
- Admin search, status filters, CSV export, and status updates
- Duplicate protection by phone number and Instagram name
- Privacy notice on registration submission
- Basic rate limiting on public registration submissions
- Optional automated email messages through Gmail SMTP

## Next implementation steps
- Create a Firebase App Hosting backend for the repository
- Add production secrets and environment variables in Firebase App Hosting
- Configure Gmail SMTP environment variables
- Test production registration, admin login, status update, automated email send, and CSV export
- Add a fuller privacy/legal page if the event link will be shared broadly

## Environment
- `ADMIN_PASSWORD`: admin login password. Defaults to `keller-party-admin` in local development if unset.
- `SESSION_SECRET`: long random string used to sign admin session cookies. Falls back to `ADMIN_PASSWORD` if unset.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key used only on the server.
- `SMTP_HOST`: SMTP host. For Gmail, use `smtp.gmail.com`.
- `SMTP_PORT`: SMTP port. For Gmail SSL, use `465`.
- `SMTP_SECURE`: set to `true` for port `465`.
- `SMTP_USER`: mailbox username, for example `kellerparty001@gmail.com`.
- `SMTP_PASSWORD`: mailbox SMTP password. For Gmail this must be a Google App Password, not the normal account password.
- `EMAIL_FROM`: sender address, for example `Keller Party <kellerparty001@gmail.com>`.
- `EMAIL_REPLY_TO`: optional reply-to address.

For Firebase App Hosting, keep secrets in Secret Manager and map them through [apphosting.yaml](/C:/Users/KingsleyChukwumezie/Projects/Keller_Party/apphosting.yaml). In this repo, `ADMIN_PASSWORD`, `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM` are configured as secrets. `EMAIL_REPLY_TO` is optional and defaults to an empty value.

## Email automation setup
1. In the Gmail account, enable 2-Step Verification.
2. Create a Google App Password for the app.
3. Set `SMTP_USER=kellerparty001@gmail.com`.
4. Set `SMTP_PASSWORD` to the Google App Password.
5. Set `EMAIL_FROM="Keller Party <kellerparty001@gmail.com>"`.
6. Optionally set `EMAIL_REPLY_TO` if replies should go to a different inbox.
7. Submit a test registration and accept it from `/admin`.

The app copy for these messages lives in `lib/email-copy.js`.

## Supabase setup
1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run the SQL in `supabase/schema.sql`.
4. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `SESSION_SECRET` to `.env.local`.
5. Run `npm run check:supabase`.
6. Restart the app server.

## Firebase App Hosting deployment
This app uses Next.js App Router and server routes, so the correct Firebase target is App Hosting rather than static Firebase Hosting.

### Recommended path: Firebase console with GitHub
1. Push this repository to GitHub.
2. In Firebase Console, open `Build -> App Hosting`.
3. Create a backend and connect this GitHub repository.
4. Choose the live branch you want Firebase to deploy from.
5. Keep the app root directory as the repository root.
6. Commit and push `apphosting.yaml` so App Hosting picks up the runtime config.
7. In the backend settings, create the following secrets:
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `EMAIL_FROM`
8. Run `supabase/schema.sql` in the production Supabase project.
9. Trigger the first rollout and test `/request-access`, `/admin`, and email delivery.

### Optional CLI path
If you prefer local Firebase CLI deploys instead of GitHub-triggered rollouts:
1. Install `firebase-tools` version `14.4.0` or newer.
2. Run `firebase login`.
3. Run `firebase init apphosting`.
4. Select the Firebase project and either create or attach an App Hosting backend.
5. Run `firebase deploy`.

### Notes
- Firebase's current recommendation for full-stack Next.js apps is App Hosting.
- Plain Firebase Hosting is aimed at static or SPA deployments and is not the right target for this repo as-is.
- By default, App Hosting builds on Google Cloud and serves the app through Cloud Run and Cloud CDN.
