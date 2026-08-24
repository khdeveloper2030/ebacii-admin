# EBacII Admin

React + Firebase Auth + Firestore admin dashboard for the same `exam_papers` data used by the Flutter app.

## Firebase setup

1. In Firebase Console, enable **Authentication > Google** and create a Web App.
2. Copy the Web App config values to `client/.env` using `client/.env.example`.
3. Deploy `firestore.rules` from the Firebase Console Rules tab.
4. Sign in once with the admin Gmail, then manually create `allowed_users/{admin-email}` with `{ "email": "admin@gmail.com", "allowed": true, "role": "admin" }` in Firestore. After that, the admin can add other Gmail accounts from the dashboard.

The Firestore document shape matches the Flutter `ExamListScreen`: `category`, `subject`, `title`, `year`, and `drive_url`. The document ID can be auto-generated; the Android query reads the fields.

## 1. Create the database

Create a PostgreSQL database locally or create a Neon database from the Vercel Marketplace. Copy `.env.example` to `server/.env`, set `DATABASE_URL`, then run `server/schema.sql` in the database SQL editor.

## 2. Run locally

Terminal 1:

```powershell
cd server
npm install
npm run dev
```

Terminal 2:

```powershell
cd client
npm run dev
```

Open http://localhost:5173.

## 3. GitHub

```powershell
git init
git add .
git commit -m "Create EBacII exam paper admin"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ebacii-admin.git
git push -u origin main
```

## 4. Vercel

Create two Vercel projects from this GitHub repository:

- Frontend: set Root Directory to `client`, add `VITE_API_URL` pointing to the deployed backend URL.
- Backend: set Root Directory to `server`, add `DATABASE_URL` and `NODE_ENV=production`.

Create a Neon PostgreSQL database through Vercel Marketplace, run `server/schema.sql`, and copy its connection string to the backend project's `DATABASE_URL`.
