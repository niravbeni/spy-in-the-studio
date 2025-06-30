# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

## 2. Set Up the Database

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands from `supabase-setup.sql` to create the required table

## 3. Get Your Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy your Project URL and anon public key

## 4. Configure Environment Variables

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Example:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. Development vs Production

- **Without Supabase configured**: The app will use in-memory storage (perfect for development/testing)
- **With Supabase configured**: The app will persist data to your Supabase database (perfect for production)

## 6. Deploy to Vercel

1. Push your code to GitHub
2. Deploy to Vercel
3. Add the environment variables in your Vercel project settings
4. Redeploy

Your app will now work properly in serverless environments! 