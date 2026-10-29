# &nbsp;&nbsp;UNIVERSAL MEDIA & STORAGE HUB (OmniTransfer)

## Project Specification & Architecture Blueprint

**Status:** Ready for Implementation  
**Target Platforms:** Linux, Windows, macOS  
**Tech Stack:** Electron \+ React (Vite) \+ Node.js \+ Tailwind CSS  
**Cloud Integration:** Google Drive API (OAuth2)

---

## 1\. Executive Summary & Vision

The **Universal Media & Storage Hub** is an open-source desktop application designed to bridge the gap between cloud storage (Google Drive) and physical storage (USB drives, external hard drives, SD cards, phones/MTP, and local disks).

### Core Value Propositions:

1. **Universal Transfer Engine:** Seamlessly move files from **Peripheral A $\rightarrow$ Peripheral B**, **USB $\rightarrow$ Google Drive**, or **Google Drive $\rightarrow$ Local Storage** without manually copying back and forth.  
2. **App-Aware Media Categorization:** Automatically scans and organizes chaotic media folders by their source applications (WhatsApp, Instagram, Camera/DCIM, Screenshots, Downloads).  
3. **Effortless Cleanup (Smart Purge):** Identifies clutter that requires zero mental effort to delete—such as WhatsApp "Sent" media (which duplicate camera photos), identical file duplicates (checksum-matched), and junk cache files.  
4. **React Skill Refresher:** Serves as a modular, real-world project to master React components, hooks (`useState`, `useEffect`, `useMemo`, `useCallback`), custom hooks, and state management (Zustand).

---

## 2\. Architecture & Tech Stack

```
+-------------------------------------------------------------------------+
|                       ELECTRON DESKTOP APPLICATION                      |
+-------------------------------------------------------------------------+
|                                                                         |
|  [RENDERER PROCESS - Frontend]                                          |
|  - React 18+ (bundled with Vite)                                        |
|  - Tailwind CSS + Lucide React (Icons)                                  |
|  - State Management: Zustand (Transfer queue, active drives, selections)|
|                                                                         |
|                                    ^                                    |
|                                    | IPC Bridge (`preload.js`)          |
|                                    v                                    |
|                                                                         |
|  [MAIN PROCESS - Native Node.js Backend]                                |
|  - Drive Detection: `drivelist` / OS mount listener                     |
|  - File System Access: `node:fs/promises`, `node:stream`                |
|  - Duplicate Engine: `node:crypto` (SHA-256 chunked hashing)            |
|  - Cloud Integration: `@googleapis/drive` (OAuth2 token exchange)       |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Why Electron?

- **Raw File System Access:** Bypasses browser sandbox limits.  
- **Peripheral Auto-Detection:** Automatically alerts the UI when a USB drive or SD card is inserted or removed.  
- **Memory-Efficient Transfers:** Uses Node.js streams (`fs.createReadStream().pipe()`) to transfer 10GB+ video files without freezing or memory leaks.

---

## 3\. Core Features Breakdown

### A. Universal Storage Connector

- **Local & Peripherals:** Auto-detects mounted drives (`/media/...` on Linux, `D:\` on Windows).  
- **Google Drive:** Sign in with Google using OAuth2. Browse Drive folders and sync directly to/from connected drives.  
- **Storage Health & Usage:** Displays graphical storage bars (Free Space vs. Total Capacity) for each connected source.

### B. Smart App-Aware Categorizer

Instead of navigating deep nested folder structures, media is indexed into smart categories:

- **WhatsApp Media:**  
  - `WhatsApp Images`, `WhatsApp Video`, `WhatsApp Audio`, `Voice Notes`.  
  - Special isolation for `Sent/` folders (often 50%+ of redundant space).  
- **Social Media:**  
  - Instagram downloads, saved reels, Telegram media.  
- **Camera (DCIM):**  
  - High-resolution camera photos and videos sorted by year/month.  
- **Screenshots & Documents:**  
  - PNG/JPG screen captures, PDFs, spreadsheets.

### C. Effortless Cleanup / Smart Purge

- **WhatsApp Sent Cleaner:** Detects files sent in chats that already exist in your Camera folder.  
- **Exact Duplicate Finder:** Compares file sizes first, then computes fast cryptographic hashes (SHA-256) of matching sizes to find true duplicates across different drives.  
- **Large & Unused Media:** Surfaces massive video files (\>500MB) that haven't been accessed in months.  
- **One-Click Actions:** "Select All Duplicates", "Archive to Google Drive", or "Permanently Delete".

### D. Universal Transfer Engine

- Select source files $\rightarrow$ Select destination drive/cloud folder $\rightarrow$ Click **Transfer**.  
- Features:  
  - Pause / Resume transfers.  
  - Conflict resolution (Overwrite, Skip, Auto-Rename).  
  - Progress tracker with speed indicator (MB/s) and estimated time remaining.

---

## 4\. React Learning & Implementation Roadmap

| Phase | Milestone | React Concepts Practiced |
| :---- | :---- | :---- |
| **Phase 1** | **UI Scaffolding & Design** | Component hierarchy, JSX, Tailwind CSS, `useState` (active tabs, selected items). |
| **Phase 2** | **Electron IPC & File Scanning** | `useEffect` (mounting, listeners), async data fetching from Electron bridge, loading states. |
| **Phase 3** | **Media Grid & Smart Filtering** | `useMemo` (instant filtering of 1,000+ files), `useCallback` (event handlers), virtualized lists. |
| **Phase 4** | **Effortless Cleanup & Duplicates** | Custom hooks (`useDuplicates`, `useWhatsAppParser`), batch selection state. |
| **Phase 5** | **Google Drive Integration** | OAuth2 state, token storage, API pagination. |
| **Phase 6** | **Transfer Engine & Progress** | Global state (Zustand), real-time progress bars, notifications. |

---

## 5\. Recommended Project Directory Structure

```text
omnitransfer/
├── electron/
│   ├── main.js             # Electron main process (Node.js)
│   ├── preload.js          # Secure IPC contextBridge
│   ├── driveDetector.js    # USB/peripheral auto-detector (drivelist)
│   ├── fileScanner.js      # Media classifier & duplicate hasher
│   └── googleDrive.js      # Google Drive API & OAuth2 handler
├── src/                    # React Application (Renderer)
│   ├── components/
│   │   ├── Sidebar.jsx     # Connected drives list & Google Drive account
│   │   ├── MediaGrid.jsx   # Thumbnail grid for categorized media
│   │   ├── CleanupTab.jsx  # Duplicates & WhatsApp Sent cleaner
│   │   ├── TransferBar.jsx # Active transfer progress & speeds
│   │   └── StorageCard.jsx # Drive capacity indicator
│   ├── hooks/
│   │   ├── useDrives.js    # Hook to subscribe to connected drives
│   │   ├── useMedia.js     # Hook to scan and filter media
│   │   └── useTransfer.js  # Hook to dispatch file copy/move tasks
│   ├── store/
│   │   └── useStore.js     # Zustand store for selections & queue
│   ├── App.jsx             # Main app container
│   ├── main.jsx            # React root mount
│   └── index.css           # Tailwind directives
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 6\. How to Resume This Project in Any Gemini Session

Whenever you open a new conversation with Gemini or any assistant, paste this prompt:

> *"I am working on the **Universal Media & Storage Hub (OmniTransfer)** project. It is an Electron \+ React desktop application connecting Google Drive and peripheral drives (USB/SD) with app-aware media sorting (WhatsApp/Instagram), effortless cleanup (duplicates/sent media), and universal transfer. Please refer to `/home/misthios/Documents/UNIVERSAL_MEDIA_TRANSFER_PROJECT_SPEC.md` and let's start Phase 1 by scaffolding the project."*

&nbsp;