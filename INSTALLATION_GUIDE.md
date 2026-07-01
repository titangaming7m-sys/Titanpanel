# Panel Download Center — Installation & Deployment Guide

This repository contains the complete, production-ready full-stack **Panel Download Center** application built with React, Vite, Tailwind CSS v4, Express, and Firebase (with local DB redundancy fallback).

---

## Technical Specifications & Features

- **Frontend Core**: React 19, Lucide Icons, Modern Glassmorphism Tailwind layout, dynamic query/search bar.
- **Backend Service**: Express.js server providing secure APIs for tracking visits, session management, dynamic file downloading, and file uploads.
- **Admin Gateway**: Separate Control panel with statistics logs, panel settings management, branding assets upload tool, system file manager, JSON backup/restore modules.
- **Dynamic Data Storage**: Integrated with Firebase Firestore. Falls back instantly to a local, structured JSON file system cache (`/data/db.json`) if Firebase is unconfigured or unavailable.
- **Security Protections**:
  - **CSRF Immune**: High-security session tokens sent via `Authorization: Bearer <token>` headers instead of auto-cookies.
  - **Secure Hashing**: Password storage using `bcryptjs`.
  - **Input Validation**: Sanitizes physical filenames to prevent Path Traversal or XSS.
  - **Sandbox Downloads**: Downloads are forced through an attachment headers pipe to prevent malicious files executing script inside browser contexts.

---

## 🚀 Fast Installation Guide (Local Development)

### 1. Prerequisites
Ensure you have **Node.js v18+** and **npm** installed on your workstation.

### 2. Install Project Dependencies
Run npm installation inside the project workspace:
```bash
npm install
```

### 3. Setup Configuration Variables
Create a `.env` file in the root directory (based on `.env.example` template):
```env
# Server Ingress Port (hardcoded to 3000 inside containers)
PORT=3000

# Optional Firebase API Keys (Only if using Firebase, otherwise uses local fallback db automatically)
GEMINI_API_KEY="YOUR_KEY_HERE"
```

### 4. Boot Dev Server
Start the Express API server and Vite compiler:
```bash
npm run dev
```
The application will boot on **http://localhost:3000**.

---

## 📦 Production Bundling & Deployment

### 1. Build Compilation
Run the unified compiler to compile assets and bundle the server:
```bash
npm run build
```
This performs a two-step process:
1. Compiles frontend assets into highly optimized static production files inside `/dist`.
2. Bundles the TypeScript `server.ts` into a standalone, ultra-fast CJS executable file: `dist/server.cjs` using `esbuild`.

### 2. Standalone Start Command
Launch the high-performance compiled package:
```bash
npm run start
```

---

## 🔒 Administrator Authentication Details

- **Default Administrator Username**: `admin`
- **Default Master Password**: `adminpassword`

> **Note**: For security, navigate to **Admin Security** inside the Control Center immediately upon installation to update the Master Password. The database will safely store a hashed salted bcrypt structure.
