# 🧰 Libraries & Utilities

This directory contains helper functions, constants, and client configurations used across the application.

## 🛠️ Utilities

### `supabaseClient.ts`
Initializes and exports the typed Supabase client for database interactions.
- **Data Fetching:** Used by `MobileGlobeReviews` and Admin pages to fetch/insert data.
- **Env Vars:** Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### `cn.ts` (ClassNames)
A utility to merge Tailwind classes conditionally.
- Wraps `clsx` and `tailwind-merge`.
- Usage: `className={cn("base-class", condition && "active-class")}`

### `constants.ts`
Global constant values used for dropdowns and config.
- **`SERVICES`**: Array of service names displayed in the Navbar and Hero text.

## 📦 External Dependencies
- **`@supabase/supabase-js`**: Database interaction.
- **`clsx` / `tailwind-merge`**: CSS class management.
