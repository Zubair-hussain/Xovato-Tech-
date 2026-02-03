# 🧩 Component Library

This directory contains the reusable UI components used throughout the Xovato Tech application.

## 📂 Directory Structure

### 📍 `landing/`
Components specific to the main landing page and marketing sections.
- **`Navbar.tsx`**: Resulting navigation bar (About - Logo - Services).
- **`Hero.tsx`**: Main entry hero section with 3D elements.
- **`Sections.tsx`**: Orchestrator for the main page scroll sections.
- **`Globe/`**: 3D Globe visualization components.

### 💬 `chat/`
Components for the AI-powered Customer Support Assistant.
- **`ChatWidget.tsx`**: The floating bubble and chat window container.
- **`ChatInterface.tsx`**: The internal message list and input area.

### 🖥️ `client/`
Interactive client-side specific components.
- **`ContactInterface.tsx`**: The multi-step contact form for project inquiries.
- **`GlassProofPanel.tsx`**: A reusable glassmorphic container used for visual proof/testimonials.

## 🎨 Design System
All components utilize **Tailwind CSS** for styling, with a focus on:
- **Dark Mode**: The primary theme is different shades of black (`bg-zinc-950`).
- **Glassmorphism**: Heavy use of `bg-white/5`, `backdrop-blur`, and `border-white/10`.
- **Emerald Accents**: The primary brand color is Emerald (`emerald-500` / `#10b981`).
