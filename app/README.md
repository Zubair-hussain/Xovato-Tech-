# 📂 Application Directory

This directory contains the main application logic, routing, and page structures for Xovato Tech, built using the **Next.js 14+ App Router**.

## 🏗️ Structure Overview

### 🌍 Application Routes (Pages)
| Route | Path | Description |
|-------|------|-------------|
| **Home** | `/page.tsx` | The main landing page (`LandingPage.tsx`), featuring sections for Services, About, and Contact. |
| **Admin** | `/admin/*` | Secure dashboard for managing inquiries and reviews. |
| **Services** | `/services/` | Detailed breakdown of offered services. |
| **About** | `/about/` | Company information and mission. |

### 🛠️ Core Files
- **`layout.tsx`**: Defines the global wrap, including:
    - `Providers` (Context providers)
    - `IntroSplash` (First-load animation)
    - `ChatWidget` (Global floating AI assistant)
- **`globals.css`**: Global Tailwind CSS styles and custom animations.
- **`fonts.ts`**: Font configurations (Geist Sans/Mono).

## 🔐 Admin Dashboard
Located in `/admin`, this section is protected and meant for internal use only.
- **`/admin/reviews`**: Interface to view `project_inquiries` and approve/hide user submitted `reviews`.

## 🤖 API Routes
Located in `/api`, these handle server-side logic (see `/api/README.md` for details).
- **`/api/chat`**: Handles AI Assistant responses.
