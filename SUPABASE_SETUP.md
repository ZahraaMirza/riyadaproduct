# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `product-demo-day`
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
5. Click "Create new project"

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL commands
4. This will create all necessary tables and insert default data

## Step 3: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## Step 4: Configure Environment Variables

1. Create a `.env` file in your project root
2. Add the following variables. **Note the `VITE_` prefix is required for Vite projects.**

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 5: Restart Your App

**This is a critical step!** After creating or changing your `.env` file, you must stop and restart your development server for the changes to take effect.

```bash
# Stop the server (if running) with Ctrl+C
npm run dev
```

## Step 6: Test the Connection

1. Start your development server: `npm run dev`
2. Check the browser console for any connection errors
3. Try creating a booking to test the database

## Database Structure

### Tables:
- **rooms**: Room information
- **startups**: Startup information with available spots
- **bookings**: User bookings with selected startups

### Features:
- ✅ Real-time subscriptions
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamps
- ✅ Foreign key relationships
- ✅ Performance indexes

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure your Supabase project allows your domain
2. **RLS errors**: Check that the policies are correctly set up
3. **Connection errors**: Verify your API keys are correct

### Enable Real-time:
1. Go to **Database** → **Replication**
2. Enable real-time for all tables
3. This allows live updates across all connected clients

## Next Steps

After setup, your app will:
- Store all data in Supabase cloud database
- Provide real-time updates across all devices
- Scale automatically with Supabase infrastructure
- Have automatic backups and security 