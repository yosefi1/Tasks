# Task Manager

A personal task management web app with a clean, modern UI and full CRUD. Built with Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Prisma, React Hook Form, Zod, and TanStack Query. **Neon Postgres** for dev + production so data persists and you can deploy to Vercel.

## Features

- **Tasks**: Create, read, update, delete with title, description, category (personal/work), status (backlog/in progress/done), steps with progress, links (name + URL + note), optional due date and priority.
- **Sources**: CRUD for links/sources with topic, bulk paste.
- **Dashboard**: Task list (cards), filters, search, progress bars, summary. Click a card to edit; Delete inside the form.

## Local setup (Neon Postgres)

### 1. Create a Neon database

1. Go to [neon.tech](https://neon.tech) and sign in (or sign up).
2. Create a project and copy both connection strings:
   - **Pooled connection** → for `DATABASE_URL` (app + serverless).
   - **Direct connection** → for `DIRECT_URL` (migrations).

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```
DATABASE_URL="postgresql://...?sslmode=require"   # Pooled
DIRECT_URL="postgresql://...?sslmode=require"     # Direct (for migrations)
```

### 3. Run migrations

Creates tables in your Neon DB:

```bash
npm run db:migrate
```

(or `npm run db:deploy` for production-style apply-only)

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### (Optional) Prisma Studio

```bash
npm run db:studio
```

## Deploy to Vercel (Git + Neon)

Data is stored in Neon, so it’s accessible from anywhere and persists across deploys.

### 1. Push to Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/task-manager.git
git push -u origin main
```

### 2. Create Neon project (if you don’t have one)

At [console.neon.tech](https://console.neon.tech): create a project and note:

- **Pooled connection** → `DATABASE_URL`
- **Direct connection** → `DIRECT_URL`

### 3. Connect and deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your Git repo.
2. **Environment variables** (Settings → Environment Variables):
   - `DATABASE_URL` = your Neon **pooled** connection string.
   - `DIRECT_URL` = your Neon **direct** connection string.
3. **Build**: leave default. The project uses `prisma generate && prisma migrate deploy && next build`, so migrations run on every deploy and data persists.
4. Deploy. Your app will be live and any data you add will be stored in Neon.

### 4. (Optional) Use a separate Neon branch for production

Create a branch in Neon for production and set `DATABASE_URL` and `DIRECT_URL` in Vercel to that branch’s URLs. Use another branch (or another project) for local dev.

## Scripts

| Script            | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Next.js dev server                       |
| `npm run build`   | Migrate + generate + Next build          |
| `npm run start`   | Start production server                  |
| `npm run db:generate` | Generate Prisma Client              |
| `npm run db:migrate`  | Run migrations (dev, interactive)    |
| `npm run db:deploy`   | Apply migrations (CI/production)     |
| `npm run db:studio`   | Open Prisma Studio                  |
| `npm run db:push`    | Push schema without migrations       |

## Tech stack

- **Next.js 14+** (App Router), **TypeScript**
- **TailwindCSS**, **shadcn/ui**
- **Prisma** + **Neon Postgres**
- **React Hook Form** + **Zod**, **TanStack Query**

Single-user app; no authentication.
