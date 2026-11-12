# Universal Media Manager

Desktop-ready media & cloud storage manager powered by a **NestJS** backend and an auto-managed **Rclone** RC daemon (`--rc-serve`).

---

## Current Progress

### Completed
- **Rclone Daemon Lifecycle (`RcloneProcessService` & `RcloneService`)**
  - Automatic `rclone rcd` startup (`--rc-no-auth --rc-addr=127.0.0.1:5572 --rc-serve`), health checks, and graceful shutdown cleanup.
  - Typed RC HTTP client (`POST` JSON calls + raw HTTP stream fetching for `--rc-serve`).
- **Authentication & Remote Management (`/auth`)**
  - `POST /auth/connect-gdrive` — Async Google Drive OAuth onboarding via background job.
  - `POST /auth/stop-oauth` — Cancel pending OAuth listener.
  - `GET /auth/accounts` — List linked cloud accounts.
  - `DELETE /auth/disconnect` — Remove a linked cloud account.
- **Jobs & Live Progress (`/jobs`)**
  - `GET /jobs/stream` — Global Server-Sent Events (SSE) stream for async job progress.
  - `GET /jobs/:jobId` — Query current state of a queued/running/completed job.
- **Rclone Engine Utilities (`/rclone`)**
  - `GET /rclone/version`, `GET /rclone/remotes`, `GET /rclone/quota`, `GET /rclone/list`, `GET /rclone/stats`.
- **File Exploration & Streaming (`/explorer`)**
  - `POST /explorer/list` — Async directory scan via background job + SSE.
  - `POST /explorer/all-files` — Recursive remote scan organized by media categories (`FOLDER`, `OTHER`, and extension groups from `MediaFileExtensions`).
  - `GET /explorer/file-content` — Metadata lookup (`operations/stat`), directory validation, `Range` support (when size is known), client-disconnect abort handling, and direct HTTP streaming/download (`inline` / `attachment`) via Rclone `--rc-serve` (including unknown-size `-1` exports like Google Docs).

### Next Up
- **File Operations:** Single-item create folder (`mkdir`), rename/move, and delete endpoints.
- **Transfer & Sync Engine:** Async `copy`, `move`, `sync`, and bulk `purge` with `core/stats` progress wired into `JobManagerService`.
- **Frontend Integration:** Connect UI views to `/auth`, `/explorer`, and `/jobs/stream`.

---

## Getting Started (Starting the Server)

1. **Prerequisites**
   - **Node.js** (v18+ recommended) and **npm**
   - **Rclone binary:** In development, `RcloneProcessService` looks for `rclone/rclone.exe` (relative to the repo root, configured in `app/backend/common/config/config.json`). On startup, NestJS automatically launches:
     ```text
     rclone rcd --rc-no-auth --rc-addr=127.0.0.1:5572 --rc-serve
     ```

2. **Install dependencies**
   ```powershell
   cd app/backend
   npm install
   ```

3. **Configure environment variables (optional, for Google Drive OAuth)**
   Create a `.env` file in `app/backend/.env` (or the repo root):
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
   *(See the **Google Drive Auth & Client ID Setup** section below for details.)*

4. **Start the backend server**
   ```powershell
   # Development (auto-reloads on file changes)
   npm run dev

   # Or standard start
   npm start
   ```

5. **Verify it is running**
   - **Backend URL:** `http://127.0.0.1:3000`
   - **Swagger UI:** `http://127.0.0.1:3000/docs`
   - **Health check:** Call `GET /rclone/version` in Swagger to confirm NestJS is talking to the Rclone daemon.
   - **Typecheck:** `npx tsc --noEmit`

---

## Google Drive Auth & Client ID Setup

`POST /auth/connect-gdrive` supports two ways to authenticate Google Drive remotes:

### Option A: Custom Google OAuth Credentials (Recommended)
Using your own Google Cloud OAuth credentials avoids Rclone's shared rate limits and gives you full control over your app's quota:
1. In **Google Cloud Console**, create/select a project and enable the **Google Drive API**.
2. Configure the **OAuth consent screen** (add your Google account as a Test User if the app is in Testing mode).
3. Create **OAuth 2.0 Client ID** credentials of type **Desktop app**, and copy the **Client ID** and **Client Secret**.
4. Provide them in either of two ways:
   - **Via `.env` (applies as default for all connections):** Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `app/backend/.env` (loaded automatically by `ConfigService`).
   - **Per request:** Pass `clientId` and `clientSecret` directly in the `POST /auth/connect-gdrive` request body (overrides `.env` for that connection).

### Option B: Omit Client ID & Secret (Quick Testing)
Both `clientId` and `clientSecret` are optional in `ConnectDriveDTO`. If neither `.env` nor the request body provides them, Rclone falls back to its built-in default OAuth credentials.

### How the OAuth Flow Works
1. Call `POST /auth/connect-gdrive` with `{ "name": "my-google-drive" }` (plus optional `scope`, `clientId`, `clientSecret`).
2. Subscribe to `GET /jobs/stream` (SSE) with the returned `jobId` to track status (`INIT` → `WAITING` → `SUCCESS` / `FAILED`).
3. Rclone opens your default browser for Google sign-in and consent. Once approved, the remote is saved in Rclone's config.
4. Verify linked accounts with `GET /auth/accounts` (or cancel a stalled login with `POST /auth/stop-oauth`).
