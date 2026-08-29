# MarketMet Next.js Backend

This directory is the Vercel-native replacement for the legacy Spring Boot backend.

## Vercel project settings

- Root Directory: `BackendNext`
- Framework Preset: Next.js
- Build Command: `npm run build`

## Required environment variables

- `DATABASE_URL` - PostgreSQL connection string (Neon works well with Vercel)
- `JWT_SECRET` - long random secret
- `ADMIN_EMAIL` - admin login email(s), comma-separated if needed
- `ADMIN_DEFAULT_PASSWORD` - bootstrap password used only when the admin account does not exist yet
- `APP_FRONTEND_URL` - deployed frontend URL
- `APP_CORS_ALLOWED_ORIGINS` - deployed frontend URL(s)

## Optional environment variables

Email:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `APP_MAIL_FROM`

Images:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

Other:
- `ADMIN_WHATSAPP`

## Database initialization

The deployment build runs `prisma db push`, so the initial PostgreSQL schema is created automatically after `DATABASE_URL` is configured.

## Compatibility

The backend intentionally keeps the existing `/api/...` endpoint contract used by `Frontend/src/services/api.js` so the React/Vite frontend can migrate without a rewrite.

Health check: `/api/health`
