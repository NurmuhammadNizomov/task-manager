# Task Manager

Full-stack project and task management app built with Nuxt 3 and MongoDB.

## Features

- **Auth** — Email/password + Google OAuth, email verification, password reset, JWT with httpOnly cookies
- **Projects** — Create, edit, delete, drag-drop reorder, status (active / archived / completed), search & filter, pagination
- **Kanban** — Tasks by status (Planned → In Progress → In Review → Done), drag-drop, priority, due dates, file attachments
- **Team** — Invite members by email, view members across all projects
- **Notifications** — Bell dropdown, mark as read, unread count
- **Dashboard** — Live stats: open tasks, completed this week, team members
- **i18n** — English, Russian, Uzbek (saved per user in DB)
- **Theme** — Light / Dark / System (saved per user in DB)

## Stack

|            |                                                     |
| ---------- | --------------------------------------------------- |
| Frontend   | Nuxt 4, Vue 3, Nuxt UI v3, Tailwind CSS v4          |
| Backend    | Nitro, Mongoose, MongoDB                            |
| Auth       | JWT (access + refresh tokens), bcrypt, Google OAuth |
| Storage    | Cloudinary                                          |
| Email      | Nodemailer (SMTP)                                   |
| Validation | Zod v4                                              |

## Getting Started

```bash
npm install
cp .env.example .env   # fill in values
npm run dev
```

## Environment Variables

See [`.env.example`](.env.example) for all variables. Minimum required:

```env
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
APP_BASE_URL=http://localhost:3000
```

## Docker

```bash
docker compose up -d
```

Starts the app and a MongoDB container. Configure secrets in `.env` before running.

## Netlify Deployment

```bash
npm run build
```

[`netlify.toml`](netlify.toml) sets `NITRO_PRESET=netlify` automatically. Add environment variables in the Netlify dashboard.

## Project Structure

```
app/
  pages/        # dashboard, projects, tasks, team, profile
  components/   # kanban, layout, UI components
  composables/  # useAuth, useProjects, useKanban, useNotifications
  layouts/      # default.vue, dashboard.vue
server/
  api/          # auth, projects, tasks, notifications, team, dashboard
  modules/      # auth, projects, tasks, notifications (models + services)
  utils/        # db, api-response, i18n, sanitization
i18n/locales/   # en.json, ru.json, uz.json
```

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run lint         # ESLint
npm run format       # Prettier
```
