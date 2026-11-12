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

## Backend Development

From `app/backend`:

```powershell
npm install
npm run dev
```

- **Backend URL:** `http://127.0.0.1:3000`
- **Swagger UI:** `http://127.0.0.1:3000/docs`
- **Typecheck:** `npx tsc --noEmit`
