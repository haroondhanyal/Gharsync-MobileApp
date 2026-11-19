# GharSync Mobile

<p align="center">
  <img src="./assets/icon.png" width="112" alt="GharSync mobile app icon" />
  <br />
  <img src="./assets/splash-lockup.png" width="520" alt="GharSync native mobile launch screen branding" />
  <br />
  <strong>GharSync mobile app · iOS and Android</strong>
</p>

GharSync Mobile is the native companion app for GharSync service businesses. It gives owners, managers, technicians and platform operators a phone-first workspace for customer records, home assets, service jobs, quotes, invoices, inventory, team operations and support.

The app is built with Expo and React Native and connects to the existing GharSync API. Business rules, tenant isolation, role permissions, financial calculations and audit records remain server-owned.

## Product coverage

The current implementation follows all ten delivery phases in [MOBILE_PHASES.md](./MOBILE_PHASES.md).

| Area | Capabilities |
| --- | --- |
| Account and workspace | Sign in, registration, phone verification, password recovery, workspace creation, invitation acceptance, organization and branch selection, profile and security |
| Daily operations | Dashboard metrics, customer search/create, booking filters and creation, job status flow, scheduling and technician assignment |
| Home care | Properties, assets, warranty records, private document uploads and QR asset lookup |
| Money and stock | Quotes, invoices, payment activity and decisions, product/supplier catalog, stock movements and warranty claims |
| Team and support | Workforce and technician availability, time-off requests, in-app notifications, AI service drafts, multimodal help desk |
| Navigation and appearance | Side drawer across workspace modules, configurable drawer side, system/light/dark themes, and optional floating AI chat |
| SaaS operations | Plan and usage view, plan requests, and role-protected platform administration |

Availability of some actions depends on organization role, plan entitlement, server configuration and the API's current provider integrations. The app reports server errors and unavailable AI/provider states rather than pretending those operations succeeded.

## Screens

```text
app/
├── (auth)/             Sign in, registration, phone verification, recovery
├── (tabs)/             Drawer layout, dashboard, customers, bookings and details
│   ├── feature/[slug]  Workspace modules, including appearance settings
│   ├── booking/[id]    Job workflow, quote and invoice actions
│   ├── invoice/[id]    Invoice and payment ledger
│   └── scan             Camera QR asset lookup
└── workspace-setup.tsx Create workspace or accept invitation
src/
├── api/client.ts       API requests, bearer access and refresh retry
├── auth/               Session context and secure token storage
├── appearance/         Persisted theme, drawer side and AI bubble preferences
└── components/         Shared UI, drawer content, AI chat and feature screens
```

## Technology

- Expo SDK 58, Expo Router and React Native 0.88
- React 19.3 and TypeScript 6 with strict type checking
- TanStack Query for server state, caching, loading and mutation flows
- `expo-secure-store` for native access and refresh tokens
- Expo Camera, Document Picker and Image Picker for device features
- `libphonenumber-js` and a bundled country/city catalogue for international registration forms
- Shared design tokens, safe-area layout, keyboard-aware forms and accessible controls
- Local AI chat through the GharSync API to Ollama (`lfm3-omni` by default); the Service assistant keeps its separate, plan-gated draft API

## Brand, app icon and launch screen

The native app includes a custom GharSync house mark in the product palette: forest green (`#173F35`), warm off-white (`#F7F7F2`) and muted gold (`#D9CF8E`). Expo uses `assets/icon.png` for the iOS app icon, `assets/adaptive-icon.png` for the Android adaptive foreground and `assets/splash-lockup.png` for the native launch screen. The splash uses the warm product background and remains visible until SecureStore session restoration is complete.

![GharSync mobile app icon](./assets/icon.png)

![GharSync native splash-screen lockup](./assets/splash-lockup.png)

The source artwork is reproducible with the checked-in macOS Swift renderer:

```sh
swift scripts/generate-web-brand-assets.swift
```

This regenerates the three PNG assets without installing an image package. Expo icon/splash changes are native project configuration; create a new native development or store build to see them on an installed app. Reloading only the JavaScript bundle does not replace an already installed native icon or launch screen.

## Requirements

- Node.js `24.6.0` (see `.nvmrc`)
- npm
- Xcode and iOS Simulator for iOS simulator builds, or Android Studio/SDK for Android
- A running GharSync API with the native authentication endpoints described below

## Local development

Demo account emails, the shared password, workspace roles, and seed instructions are recorded in [DEMO_ACCOUNTS.md](./DEMO_ACCOUNTS.md). Run `npm run seed:demo-accounts` against a local API to create 10 owners, 10 admins, and 10 technicians, then `npm run seed:demo-data` to populate their workspaces with module records.

1. Install dependencies:

   ```sh
   npm ci
   ```

2. Create a local environment file:

   ```sh
   cp .env.example .env
   ```

3. Set `EXPO_PUBLIC_API_BASE_URL` in `.env` to the API's versioned base URL. The environment variable is embedded in the client bundle and must never contain secrets.
4. Start the API and then start Expo:

   ```sh
   npm start
   ```

5. Open the project using the Expo Go/development client QR code, or use `npm run ios` / `npm run android` when the relevant simulator is installed.

### API host by device

- iOS Simulator: `http://localhost:4000/api/v1` usually reaches the development Mac.
- Android Emulator: use `http://10.0.2.2:4000/api/v1` for the host machine.
- Physical device: use the Mac's LAN address, for example `http://192.168.1.10:4000/api/v1`; phone and computer must be on the same network and the API must listen on a reachable interface.
- Production: use the HTTPS API host configured for the deployment.

Android production builds should use HTTPS. Do not ship a local or cleartext development URL.

### Local Ollama assistant

Run Ollama on the same computer as the GharSync API, then install the configured model:

```sh
ollama serve
ollama pull lfm3-omni
```

The API defaults to `OLLAMA_BASE_URL=http://127.0.0.1:11434` and `OLLAMA_MODEL=lfm3-omni`. Set those variables in the API server environment if the Ollama host or model is different, then restart the API. The mobile app talks only to the GharSync API; do not put the Ollama address or credentials in the Expo `.env` or expose Ollama directly to the phone. The floating chat uses `/help-desk/chat`, while service drafts use `/ai/assist` and remain subject to API plan and permission checks.

## API and authentication contract

Base URL example: `https://api.example.com/api/v1`.

The native client uses these auth endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/mobile/register` | Create an account and native session |
| `POST` | `/mobile/sign-in` | Sign in and issue a bearer token pair |
| `POST` | `/mobile/refresh` | Rotate a refresh session |
| `POST` | `/mobile/sign-out` | Revoke a refresh session |
| `GET` | `/mobile/me` | Load the authenticated user's profile |
| `POST` | `/mobile/organizations/:organizationId/select` | Select a workspace membership |

The companion API repository needs these routes registered. A ready-to-apply API patch is in [patches/gharsync-api-mobile-auth.patch](./patches/gharsync-api-mobile-auth.patch). From the root of the GharSync API repository, apply it with `git apply /path/to/GharSync-MobileApp/patches/gharsync-api-mobile-auth.patch`, then restart the API. The patch adds the `/api/v1/mobile/sign-in` route that the app calls.

Authenticated feature requests use `Authorization: Bearer <accessToken>`. The client stores tokens in SecureStore, coalesces concurrent refresh attempts, retries a request once after a 401, and clears local session data if refresh fails. The API must validate the mobile token audience for bearer requests and continue using the web audience for browser sessions. See the API repository's deployment documentation for environment variables and provider setup.

The client serializes JSON automatically and leaves `FormData` boundaries to `fetch` for document and image uploads. API errors surface as readable messages in the relevant screen.

The floating AI chat uses `/notifications/status` to show the configured Ollama model and `/help-desk/chat` for a conversational thread with recent message history. The Service assistant screen uses `/ai/status` and `/ai/assist` for human-reviewed drafts, which follow the API's plan, feature rollout and workspace permission checks. Ollama must run on the API host; set `OLLAMA_BASE_URL` and `OLLAMA_MODEL` there when using a non-default local model.

## Useful commands

```sh
npm start                 # Start Expo/Metro
npm run ios               # Start on iOS Simulator
npm run android           # Start on Android Emulator
npm run typecheck         # TypeScript validation
npx expo-doctor           # Expo dependency/configuration diagnostics
npx expo export --platform ios --output-dir /tmp/gharsync-ios
npx expo export --platform android --output-dir /tmp/gharsync-android
```

Expo exports validate JavaScript bundling for each platform; they do not produce signed App Store or Play Store binaries.

## Native builds and release

Use EAS Build or the equivalent native build pipeline after setting the production API URL and confirming the app identifiers in `app.json`.

1. Install/configure the EAS CLI and authenticate with the release account.
2. Configure the Expo project ID for the correct organization.
3. Create development, preview and production build profiles appropriate to the team's signing setup.
4. Build and install preview binaries on physical iOS and Android devices.
5. Verify sign-in, refresh/expiry, camera permission, QR scan, file upload, keyboard forms, role restrictions, deep links and API reachability.
6. Confirm provider credentials and operational services in the API deployment (SMS/email, durable private file storage, notification providers, AI provider and payment provider as applicable).
7. Build signed store artifacts, review privacy disclosures/permission strings and submit through the appropriate store consoles.

The app's bundle identifiers are `com.gharsync.mobile` for iOS and Android. Store signing credentials and provider secrets belong in the build/service configuration, never in source control or `EXPO_PUBLIC_*` variables.

## Responsive and accessibility behavior

Screens use safe-area-aware pages and scroll containers for long content. Forms account for the on-screen keyboard; creation forms that may exceed a compact device height use scrollable modals. Main page content is capped on wide devices, while cards and controls reflow on narrow widths. Interactive selection controls expose button/selected accessibility state, headings are announced as headers, and common actions have minimum touch-friendly heights.

## Troubleshooting

- **Network request failed:** check that the API is running, the URL has `/api/v1`, the phone can reach the host, and local firewall rules allow the API port.
- **Android emulator cannot reach localhost:** use `10.0.2.2`, not `localhost`.
- **Physical device cannot reach the API:** use the computer's LAN IP and ensure both devices share a network; guest Wi-Fi may block device-to-device traffic.
- **Environment change is not reflected:** restart Metro and clear its cache with `npx expo start --clear`.
- **Sign-in returns an audience/401 error:** check that the API has the mobile auth changes deployed and that access-token audience validation is configured for native bearer requests.
- **Camera or files do not open:** grant the OS permission in app settings, then reopen the feature. QR lookup also requires a valid asset QR value and API access.
- **Expo Go says the project is incompatible:** install the Expo Go build matching this app's SDK 58 from [expo.dev/go](https://expo.dev/go?device=true&platform=android&sdkVersion=58), then restart Metro. SDK 58 is compatible with Android 11; the error means Expo Go and project SDK versions differ.
- **Native dependency mismatch:** use Node.js `24.6.0`, run `npx expo install --fix`, and then `npx expo-doctor` to align packages with the installed Expo SDK.

## Privacy and operational boundaries

- Keep `.env`, signing files, access credentials and API provider keys out of Git.
- File access and tenant authorization are enforced by the API; do not treat client-side role checks as a security boundary.
- AI output is a draft for human review, not a diagnosis or approved quote.
- Payment status changes are recorded through the server's payment ledger; this app does not claim to charge cards without a configured payment processor.
- Production operations still need server monitoring, backups, delivery-provider setup, data retention and incident-response processes.

## App previews

The branded splash also appears in Expo Go while the initial session is restored.

The repository includes its actual app icon and native launch lockup above. Product screen captures should be captured from iOS and Android preview builds with realistic test data. Review them at phone and tablet widths and remove customer or workspace personal data before using them in public documentation or store listings.

## Repository hygiene

`.env`, `node_modules`, Expo cache/output, build directories and TypeScript build artifacts are ignored. Keep the lockfile committed so local and CI dependency resolution stays repeatable.
