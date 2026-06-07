# CRA (Caldo de Rata Aguada) 💧

CRA is a full-stack mobile and web application designed to monitor and manage residential and commercial water consumption. Built for high performance and strict type-safety, it utilizes a modern backend-as-a-service architecture combined with edge computing.

## 🏗 Architecture

This project is structured as a strict **npm workspace monorepo** to share database interfaces and business logic across the stack flawlessly.

* **Frontend (`apps/mobile`):** React Native & Expo Router, styled with NativeWind v4 (Tailwind CSS) and React Native Reanimated.
* **Backend (`apps/api`):** Hono.js API designed to run on Cloudflare Workers for edge-routed tasks.
* **Database:** Supabase (PostgreSQL) accessed directly via the client for standard operations.
* **Shared (`packages/shared`):** The single source of truth for TypeScript interfaces (e.g., `WaterReading`, `Building`).

---

## ⚙️ Prerequisites 

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* **npm** (v7 or higher, required for workspaces)
* [Expo Go](https://expo.dev/go) app on your physical device, or an iOS/Android Simulator.

---

## 🚀 Installation

Because this is a strict monorepo, **all base installations must happen at the absolute root of the project.**

1. **Clone the repository:**
```bash
git clone https://github.com/Dan12245/integrador2.git
cd integrador2
```
2. **Install dependencies(execute in root folder)***
```bash
npm install
```

---

## 💻 Running the project 
Use these npm workspace commands from the root directory.

**Start the Mobile/Web App (Frontend)**
```bash
npm run start --workspace=apps/mobile
```
Note: If Metro fails to find a file, clear the cache by running: `npm run start --workspace=apps/mobile -- -c`


**Start the Hono API (backend)**
```bash
npm run dev --workspace=apps/api
```

---

## 📦 Adding New Packages (Workflow)
To prevent dependency clashes, you must follow strict workflows when adding new libraries to the project.

1. Adding Native Expo Packages (Maps, Camera, Reanimated)
You must use the Expo CLI for native mobile packages so it can match the exact version to the current Expo SDK.

```Bash
cd apps/mobile
npx expo install <package-name>
cd ../..
npm install
```

2. Adding Standard Node Packages (Zod, Axios, etc.)
Stay at the root directory and specify the target workspace:

```Bash
npm install <package-name> --workspace=apps/mobile
```

# OR
```Bash
npm install <package-name> --workspace=apps/api
```

---

## Dependency Troubleshooting
If you ever get version warnings in the Metro terminal regarding React Native packages, navigate to the mobile folder and run the automatic fix command:

```Bash
cd apps/mobile
npx expo install --check
```

---

## 🔐 Environment Variables
You will need to configure your local environment variables to connect to Supabase.

Navigate to `apps/mobile/` and create a `.env` file.

Add your Supabase credentials:

```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_publishable_key
```
