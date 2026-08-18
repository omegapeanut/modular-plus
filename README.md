# Modular+

The internal system for running Modular+: inventory, orders, customers, team
tasks, learning material, and the project schedule — all behind a login
page, shared live between the two of you.

- **Hosting:** GitHub Pages (free, auto-deploys on every push to `main`)
- **Database:** Firebase (Auth + Firestore, free Spark plan)
- **Images:** Cloudinary (free tier)
- **Frontend:** React + Vite + TypeScript + Tailwind CSS

Because Firestore pushes updates to every connected client instantly, both
of you see the same data change live — no refresh needed. Whoever adds an
order, moves a task card, or edits stock, the other person's screen updates
on its own.

## One-time setup

### 1. Create the Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it
   `modular-plus` (or anything) → you can skip Google Analytics.
2. Once created, go to **Build → Authentication → Get started** → enable
   the **Email/Password** sign-in method.
3. Still in Authentication, go to the **Users** tab → **Add user** → create
   an account for yourself and one for your partner (email + password).
   This is what actually controls who can log in — keep sign-up disabled
   in the app itself, only add users by hand here.
4. Go to **Build → Firestore Database → Create database** → start in
   **production mode** → pick a region close to you.
5. Go to **Project settings** (gear icon) → scroll to **Your apps** →
   click the **</>** (web) icon → register an app (nickname anything,
   don't set up Hosting) → copy the `firebaseConfig` values shown.
6. Back in Firestore, go to the **Rules** tab and paste in the contents of
   `firestore.rules` from this repo, then **Publish**. This restricts all
   read/write access to signed-in users only — i.e. just the two of you.

### 2. Create the Cloudinary upload preset

1. Go to https://console.cloudinary.com → your **Cloud name** is shown on
   the dashboard — copy it.
2. Go to **Settings → Upload → Upload presets → Add upload preset**.
3. Set **Signing Mode** to **Unsigned**, give it a name (e.g.
   `modular_plus_unsigned`), save.

### 3. Add the config as GitHub Secrets (so the live site can build)

In the GitHub repo: **Settings → Secrets and variables → Actions → New
repository secret**, add each of these one at a time:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

### 4. Turn on GitHub Pages

**Settings → Pages → Build and deployment → Source** → select **GitHub
Actions**. The next push to `main` (or re-running the "Deploy to GitHub
Pages" workflow under the **Actions** tab) will publish the site to
`https://<your-username>.github.io/modular-plus/`.

### 5. Add your partner to the repo

**Settings → Collaborators → Add people** → enter his GitHub username or
email. He'll get an invite; once accepted he can push, and every push
triggers a fresh deploy automatically.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the Firebase + Cloudinary values
npm run dev
```

## Adding more later

Each module (Inventory, Orders, Customers, Tasks, Learning, Schedule) is a
single file under `src/pages/`, all following the same pattern: a Firestore
collection, a small add-form, and a live list. Duplicating one of those
files is the fastest way to add a new module.
