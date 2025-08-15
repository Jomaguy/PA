# Supabase Todo System Setup Guide

## Overview
This guide will help you set up the Supabase backend for the todo system in your Personal AI Assistant app.

## Prerequisites
- A Supabase account (free tier is sufficient)
- Node.js and npm installed
- Your Personal AI Assistant app running

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: Personal AI Assistant
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users

## Step 2: Create the Todos Table

1. In your Supabase dashboard, go to "SQL Editor"
2. Create a new query and paste the following SQL:

```sql
-- Create the todos table
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  category TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID -- For future multi-user support
);

-- Add indexes for performance
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_created_at ON todos(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for now (in production, restrict this)
CREATE POLICY "Allow all operations for todos" ON todos
  FOR ALL USING (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
```

3. Click "Run" to execute the SQL

## Step 3: Configure Environment Variables

1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy the following values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **Project API Keys** → **anon** **public** (the anon/public key)

3. Create a `.env` file in your project root (copy from `.env.example`):

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Other existing variables
OPENAI_API_KEY=your_openai_api_key_here
NEWS_API_KEY=your_news_api_key_here
APP_ENV=development
```

## Step 4: Test the Connection

1. Start your development server:
   ```bash
   npm run web
   ```

2. Navigate to the "Todos" tab in your app
3. You should see the todo interface load
4. Try adding a new todo to test the connection

## Step 5: Verify in Supabase Dashboard

1. Go to "Table Editor" in your Supabase dashboard
2. Select the "todos" table
3. You should see any todos you created in the app

## Features Included

✅ **Complete CRUD Operations**: Create, read, update, delete todos  
✅ **Real-time Updates**: Changes sync across devices instantly  
✅ **Offline Support**: Works without internet, syncs when reconnected  
✅ **Priority Levels**: High, medium, low priority with visual indicators  
✅ **Categories**: Organize todos with custom categories  
✅ **Search & Filtering**: Find todos quickly with advanced filters  
✅ **Statistics**: Track completion progress and productivity metrics  
✅ **Responsive Design**: Works on both web and mobile platforms  

## Troubleshooting

### Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is not paused
- Ensure your API keys have the correct permissions

### Real-time Not Working
- Verify that the todos table is added to the realtime publication
- Check browser console for WebSocket connection errors

### Performance Issues
- The database includes proper indexes for common queries
- Consider adding pagination for large todo lists (already implemented)

## Security Notes

**Important**: The current setup uses a permissive RLS policy for development. In production, you should:

1. Implement proper user authentication
2. Restrict the RLS policy to only allow users to access their own todos
3. Add user_id constraints to all queries

Example production RLS policy:
```sql
-- Remove the current policy
DROP POLICY "Allow all operations for todos" ON todos;

-- Add secure policies
CREATE POLICY "Users can only see their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);
```

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase dashboard for any API limits or issues
3. Ensure all environment variables are properly set
4. Try the "Sync" functionality in the app if data seems out of sync

Your todo system is now ready to use! 🎉
