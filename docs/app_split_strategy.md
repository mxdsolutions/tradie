# Strategy: Splitting Tradie & Homeowner into Separate Apps

This document outlines the architectural strategy for splitting the unified TRADIE Expo app into two distinct applications while maintaining code efficiency.

## Overview
The goal is to provide a separate experience for **Homeowners** and **Tradies**, allowing for individual App Store/Play Store listings, unique branding, and independent deployment cycles, while sharing core logic and UI components.

## Recommended Architecture: Monorepo
Using a monorepo (via `pnpm` or `yarn` workspaces) is the industry standard for this use case.

### Directory Structure
```text
/
├── apps/
│   ├── homeowner/      # Homeowner Expo App
│   └── tradie/         # Tradie Expo App
├── packages/
│   ├── shared-ui/      # Common components (Buttons, Inputs, Cards)
│   ├── core/           # Supabase client, Auth logic, Utils, Constants
│   └── api/            # API types and data services
└── assets/             # Shared branding assets (Global logos, fonts)
```

## Publishing Workflow

### 1. Store Identity
Each app maintains its own identity configuration:
- **Homeowner:** `com.calibremedia.homeowner` (Bundle ID)
- **Tradie:** `com.calibremedia.tradie` (Bundle ID)
- Separate icons, splash screens, and descriptions per app.

### 2. EAS (Expo Application Services)
Easily manage builds for both platforms from the root:
- `eas build --project apps/homeowner`
- `eas build --project apps/tradie`
Each project has its own Expo dashboard for tracking version history and OTA (Over-the-Air) updates.

## Technical Considerations

### Sharing Logic
- **Authentication:** Both apps share the same Supabase backend. Users can potentially use the same credentials, but access can be restricted per app based on their role in the database.
- **Push Notifications:** Requires two separate OneSignal App IDs to distinguish between homeowner and tradie audience segments.
- **Deep Linking:** Use unique schemes (e.g., `tradie://` and `homeowner://`) to prevent app collision on the device.

## Migration Steps (Summary)
1. Initialize monorepo workspace.
2. Extract shared UI and logic into standalone packages.
3. Scaffold two new Expo apps in the `apps/` directory.
4. Port existing routes from `app/(homeowner)` and `app/(tradie)` to their respective new homes.
5. Configure independent `app.json` and EAS projects.
