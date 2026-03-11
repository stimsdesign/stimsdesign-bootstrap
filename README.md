# Test STIMS Design Bootstrap

A streamlined, blazing fast frontend-only skeleton for building Astro 6.0 marketing websites. This template provides a clean slate with Tailwind CSS and Netlify deployment pre-configured.

## 🚀 Getting Started

To use this bootstrap codebase for a new project, clone the repository and install the initial frontend dependencies:

```bash
# 1. Clone into a new project directory
git clone https://github.com/your-username/stimsdesign-bootstrap.git my-new-project
cd my-new-project

# 2. Install dependencies (Astro & Tailwind)
npm install

# 3. Copy the environment variables
cp .env.example .env

# 4. Start the dev server
npm run dev
```

## 🛠️ Included Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs the frontend dependencies               |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Compiles the site into the `dist/` directory     |
| `npm run preview`         | Serves the compiled `dist/` folder locally       |
| `npx astro check`         | Runs strict TypeScript verification on the code  |

---

## 🔌 Activating the Backend (The "Drop-in Dashboard")

This skeleton is intentionally decoupled from any backend database, authentication, or CRM logic to keep it as lightweight as possible. 

However, if your project grows and eventually requires the **STIMS Design Dashboard**, you can instantly transform this repository into a Monorepo Workspace and inject the backend.

### 1. Download the Database & Backend Submodules
Run the following commands in the root of your project to pull the secure backend packages into your repo:

```bash
# Bring in the Database Connection Pool
git submodule add https://github.com/stimsdesign/stimsdesign-core.git packages/core

# Bring in the Authentication and Dashboard CRM
git submodule add https://github.com/stimsdesign/stimsdesign-backend.git packages/backend
```

### 2. Update Packages and Workspaces
Open your root `package.json` and declare the new workspaces and their local dependencies:

```json
{
  "workspaces": ["packages/*"],
  "dependencies": {
    // ... your existing frontend dependencies
    "@stimsdesign/backend": "*",
    "@stimsdesign/core": "*"
  }
}
```
Run `npm install` again to wire up the symlinks.

### 3. Apply the "Glue Code" Stubs
This repository comes with an intentionally disabled folder located at `src/_backend-stubs/`. This folder contains the exact lines of code required to securely mount the backend into Astro.

Open the files inside `src/_backend-stubs/` and copy the code snippets appropriately into your active frontend files:

1. **`astro.config.mjs`**: Import the integration from `@stimsdesign/backend/integration` and add it to your `integrations: []` array.
2. **`src/actions/index.ts`**: Copy the stub file over to enable backend server RPC actions.
3. **`src/middleware.ts`**: Copy the stub file over to secure your application pages.
4. **`src/env.d.ts`**: Add the triple-slash reference to the backend typings file to enable TypeScript intellisense for your user sessions.

Once the stubs are applied, start your dev server and navigate to `/portal` to access your new backend!
