# Setting Up the Custom Users Table

This guide explains how to connect your Supabase Auth users with a custom `users` table for additional user data.

## 🗄️ Table Structure

The custom `users` table will have this structure:
```sql
users (
  id UUID PRIMARY KEY,           -- Auto-generated UUID
  auth_id UUID UNIQUE,           -- Links to Supabase Auth user ID
  username VARCHAR(255),         -- Display username
  email VARCHAR(255),            -- User email
  role VARCHAR(50),              -- user/admin/premium
  profile_data JSONB,            -- Additional profile info
  preferences JSONB,             -- User preferences
  created_at TIMESTAMP,          -- When record was created
  updated_at TIMESTAMP           -- When record was last updated
)
```

## 🚀 Setup Steps

### Step 1: Run the SQL Script
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `setup_users_table.sql`
4. Click "Run" to execute the script

### Step 2: Verify the Table
After running the script, you should see:
- A new `users` table in your database
- All existing Supabase Auth users migrated to the custom table
- Row Level Security (RLS) policies enabled

### Step 3: Test the Connection
Your backend API endpoint `GET /api/users/` will now return:
- User data from Supabase Auth (email, role, etc.)
- Additional data from your custom table (username, profile_data, preferences)

## 🔒 Security Features

- **Row Level Security (RLS)** enabled
- Users can only see their own data
- Admins can see all users
- Only admins can create/delete users
- Users can update their own profiles

## 📝 Adding Custom Fields

To add new fields to the users table:
```sql
ALTER TABLE public.users 
ADD COLUMN new_field_name VARCHAR(255) DEFAULT 'default_value';
```

## 🐛 Troubleshooting

### If you get permission errors:
- Make sure you're using the service role key in your backend
- Check that RLS policies are correctly set up

### If the table creation fails:
- Ensure you have the necessary permissions in Supabase
- Check that the `gen_random_uuid()` function is available

### If users aren't showing up:
- Verify that the `auth_id` field correctly links to Supabase Auth user IDs
- Check the console logs for any errors in the `getAllUsers` function

## 🔄 Data Flow

1. **User signs up** → Created in Supabase Auth + custom users table
2. **User logs in** → JWT token contains auth user ID
3. **API calls** → Backend merges data from both tables using `auth_id`
4. **Profile updates** → Updates stored in custom users table

## 📊 Benefits

- **Separation of concerns**: Auth vs. business logic
- **Extensible**: Easy to add new user fields
- **Secure**: RLS policies protect user data
- **Scalable**: Can handle complex user data without auth table bloat
- **Performance**: Indexed queries for fast lookups
