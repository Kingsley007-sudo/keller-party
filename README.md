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
- Discover documentation in `__Discover__/`
- Request-access form with persisted submissions
- Password-gated admin review page
- Supabase database storage for registrations
- Admin search, status filters, CSV export, and manual WhatsApp action
- Duplicate protection by phone number and Instagram name
- Privacy notice on registration submission
- Basic rate limiting on public registration submissions
- Optional automated WhatsApp template messages through Meta WhatsApp Cloud API

## Next implementation steps
- Create a Firebase App Hosting backend for the repository
- Add production secrets and environment variables in Firebase App Hosting
- Create and approve WhatsApp message templates in Meta Business Manager
- Test production registration, admin login, status update, automated WhatsApp send, manual WhatsApp fallback, and CSV export
- Add a fuller privacy/legal page if the event link will be shared broadly

## Environment
- `ADMIN_PASSWORD`: admin login password. Defaults to `keller-party-admin` in local development if unset.
- `SESSION_SECRET`: long random string used to sign admin session cookies. Falls back to `ADMIN_PASSWORD` if unset.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key used only on the server.
- `WHATSAPP_ACCESS_TOKEN`: Meta WhatsApp Cloud API access token.
- `WHATSAPP_PHONE_NUMBER_ID`: Meta WhatsApp phone number ID used to send messages.
- `WHATSAPP_API_VERSION`: Meta Graph API version. Defaults to `v25.0`.
- `WHATSAPP_DEFAULT_COUNTRY_CODE`: Country code used when guests enter local phone numbers. Defaults to `41`.
- `WHATSAPP_TEMPLATE_LANGUAGE`: WhatsApp template language code. Defaults to `en_US`.
- `WHATSAPP_REQUEST_TEMPLATE_NAME`: Template sent after a guest submits the request form.
- `WHATSAPP_ACCEPTED_TEMPLATE_NAME`: Template sent when an admin accepts a guest.
- `WHATSAPP_REJECTED_TEMPLATE_NAME`: Template sent when an admin rejects a guest.

For Firebase App Hosting, keep secrets in Secret Manager and map them through [apphosting.yaml](/C:/Users/KingsleyChukwumezie/Projects/Keller_Party/apphosting.yaml). In this repo, `ADMIN_PASSWORD`, `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, and `WHATSAPP_PHONE_NUMBER_ID` are configured as secrets. The WhatsApp defaults and template names are checked into `apphosting.yaml` as regular environment values.

## WhatsApp automation setup
1. Create or connect a Meta Business account with WhatsApp Cloud API access.
2. Add a WhatsApp sender phone number and copy its phone number ID.
3. Create approved request-received, accepted, and rejected message templates matching the names in `.env.example`.
4. Each current template should contain one body variable for the guest name, for example `{{1}}`.
5. Add the WhatsApp environment variables locally and in production.
6. Submit a test registration and accept it from `/admin`.

Suggested templates:
- `keller_party_request_received`: `Hi {{1}}, your Keller Party access request has been received. We will review it shortly.`
- `keller_party_access_approved`: `KELLER PARTY

Hi {{1}},
You have been selected.
We look forward to welcoming you to the Icon Club Zurich on June 27.
Please arrive promptly at 23:00.
The dress code is Elegant and will be strictly enforced.
Photography Prohibited.
Videography Prohibited.
Entry is 15 CHF and must be paid at the door by TWINT or card.
This is a private event. Your invitation is personal and non-transferable.`
- `keller_party_access_rejected`: `Hi {{1}}, thank you for your Keller Party attendance request. We are unable to approve this request.`

The app copy for these templates lives in `lib/whatsapp-copy.js`. Keep the Meta template bodies matched to those strings.

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
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
8. If you want to change the WhatsApp defaults or template names, either edit `apphosting.yaml` or override them in the Firebase console.
9. Run `supabase/schema.sql` in the production Supabase project.
10. Trigger the first rollout and test `/request-access`, `/admin`, and WhatsApp template delivery.

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
