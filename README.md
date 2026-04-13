# Keller Party

Next.js foundation for the Keller Party invitation experience.

## Scripts
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Current scope
- Next.js app router setup
- App entry files
- Base landing page shell
- Discover documentation in `__Discover__/`
- Request-access form with persisted submissions
- Password-gated admin review page
- Local SQLite database storage in `data/keller-party.sqlite`

## Next implementation steps
- Configure `ADMIN_PASSWORD` before deployment
- Search and filter controls in the admin area
- Manual WhatsApp action/link for accepted guests
- Hosted database for production deployment

## Environment
- `ADMIN_PASSWORD`: admin login password. Defaults to `keller-party-admin` in local development if unset.
