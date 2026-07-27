# DevPilot Deployment Guide

## Environment Variables

DevPilot requires the following environment variables to be set for proper deployment.

### Required Variables

#### Supabase Configuration
- `VITE_SUPABASE_URL`: Your Supabase project URL
  - Format: `https://your-project.supabase.co`
  - Get from: [Supabase Dashboard](https://app.supabase.com) → Settings → API
  
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous public key
  - Get from: [Supabase Dashboard](https://app.supabase.com) → Settings → API

#### Groq AI Configuration (Optional)
- `VITE_GROQ_API_KEY`: Your Groq API key for AI features
  - Get from: [Groq Console](https://console.groq.com/keys)
  - If not provided, a fallback demo key will be used

### Default Language
- `VITE_DEFAULT_LANGUAGE`: Set to `ar` for Arabic (default) or `en` for English

## Deployment to Vercel

### Step 1: Connect your repository to Vercel
```bash
vercel
```

### Step 2: Set Environment Variables in Vercel Dashboard
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY` (optional)
   - `VITE_DEFAULT_LANGUAGE` (optional, defaults to `ar`)

### Step 3: Deploy
```bash
git push origin main
```

## Local Development

### Setup
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your environment variables in `.env`

3. Install dependencies:
```bash
pnpm install
```

4. Start development server:
```bash
pnpm dev
```

## Troubleshooting

### Blank Page on Vercel
If you see a blank page after deployment:
1. Check that all environment variables are set in Vercel settings
2. Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
3. Verify the Supabase project is accessible from Vercel's IP addresses
4. Check browser console for errors (DevTools → Console)

### Missing Supabase Data
If you see data loading issues:
1. Verify Supabase migrations have been run:
   ```bash
   node apply-migration.mjs
   node apply-projects-migration.mjs
   ```
2. Check that your Supabase environment variables are correct
3. Ensure RLS (Row Level Security) policies are properly configured

### Localization Issues
- Arabic is now the default language
- To change default to English, set `VITE_DEFAULT_LANGUAGE=en` in Vercel environment
- Users can toggle language in the UI (top-right language icon)

## Security Notes

- Never commit `.env` files to git (already configured in `.gitignore`)
- Use Vercel's environment variables feature instead of `.env` in production
- Keep your API keys secure and rotate them regularly
- Review Supabase RLS policies to ensure data is properly protected

## Support

For issues or questions, please refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Groq API Documentation](https://console.groq.com/docs)
