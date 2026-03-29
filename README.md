# Bit by Bit Coding - Student Practice Platform

A complete Next.js 15 + Supabase platform for student coding practice with role-based access control.

## Features

- **Authentication**: Email/password auth with invite code validation
- **Role-Based Access**: Student and Admin roles with middleware protection
- **Code Editor**: Monaco Editor with Pyodide for in-browser Python execution
- **Challenge System**: Create, edit, and complete coding challenges
- **Progress Tracking**: Track user progress, impact points, and weekly hours
- **Admin Dashboard**: Manage users, challenges, and invite codes

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (@supabase/ssr for cookie-based auth)
- Monaco Editor (@monaco-editor/react)
- Pyodide (in-browser Python execution)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd bbbcoding-platform
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the contents of `setup.sql` to create all tables, RLS policies, and seed data

### 4. Create Initial Admin

After running the setup SQL, create your first admin user:

1. Go to Supabase Authentication → Users
2. Click "Add User" → "Create New User"
3. Email: `admin@bbbcoding.org`
4. Password: `bbbadmin2026` (change this in production!)
5. In the SQL Editor, run:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@bbbcoding.org';
```

### 5. Generate Invite Codes

1. Log in as admin
2. Go to `/admin/invite-codes`
3. Generate invite codes for new students

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com and create a new project
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
4. Deploy!

### 3. Update Supabase Auth Settings

In your Supabase dashboard:

1. Go to Authentication → URL Configuration
2. Set Site URL to your Vercel deployment URL
3. Add your Vercel deployment URL to Redirect URLs

## Project Structure

```
bbbcoding-platform/
├── app/                    # Next.js App Router
│   ├── (routes)/
│   │   ├── page.tsx        # Landing page
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── library/page.tsx
│   │   ├── editor/[id]/page.tsx
│   │   ├── workspace/page.tsx
│   │   ├── masters-path/page.tsx
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── challenges/page.tsx
│   │       ├── users/page.tsx
│   │       └── invite-codes/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/             # React components
│   ├── TopNavBar.tsx
│   ├── SideNavBar.tsx
│   └── BottomNavBar.tsx
├── lib/                    # Utilities
│   ├── supabase.ts
│   └── utils.ts
├── middleware.ts           # Route protection
├── setup.sql              # Database schema
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## User Roles

### Student
- Access dashboard, library, editor, workspace, masters-path
- Complete challenges and earn points
- Track progress

### Admin
- All student features
- Access `/admin` routes
- Create/edit challenges
- Manage users and roles
- Generate invite codes

## Database Schema

### profiles
- id (uuid, PK)
- email (text)
- full_name (text)
- role (enum: student, admin)
- impact_points (int)
- weekly_hours (int)
- created_at (timestamp)

### invite_codes
- id (uuid, PK)
- code (text, unique)
- used (boolean)
- used_by (uuid)
- used_at (timestamp)
- created_by (uuid)
- expires_at (timestamp)
- max_uses (int)
- use_count (int)

### challenges
- id (uuid, PK)
- title (text)
- description (text)
- difficulty (enum: beginner, intermediate, advanced)
- category (text)
- constraints (text)
- starter_code (text)
- test_cases (jsonb)
- expected_output (text)
- time_estimate (int)
- points (int)
- is_published (boolean)
- created_by (uuid)
- created_at (timestamp)

### user_progress
- id (uuid, PK)
- user_id (uuid)
- challenge_id (uuid)
- status (enum: in_progress, completed, attempted)
- code (text)
- attempts (int)
- completed_at (timestamp)
- created_at (timestamp)

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins can access all data
- Middleware protects admin routes
- Invite code validation required for signup

## License

MIT License - Bit by Bit Coding © 2026
