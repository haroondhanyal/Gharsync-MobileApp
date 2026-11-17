# GharSync Mobile

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
| SaaS operations | Plan and usage view, plan requests, and role-protected platform administration |

Availability of some actions depends on organization role, plan entitlement, server configuration and the API's current provider integrations. The app reports server errors and unavailable AI/provider states rather than pretending those operations succeeded.

## Screens

```text
app/
├── (auth)/             Sign in, registration, phone verification, recovery
├── (tabs)/             Dashboard, bookings, customers, more
├── booking/[id].tsx    Job workflow, quote and invoice actions
├── invoice/[id].tsx    Invoice and payment ledger
├── feature/[slug].tsx  Workspace modules (team, assets, inventory, billing, etc.)
├── scan.tsx            Camera QR asset lookup
└── workspace-setup.tsx Create workspace or accept invitation
src/
├── api/client.ts       API requests, bearer access and refresh retry
├── auth/               Session context and secure token storage
└── components/         Shared UI and feature screens
```

## Technology

- Expo SDK 57, Expo Router and React Native 0.86
- React 19 and TypeScript 6 with strict type checking
- TanStack Query for server state, caching, loading and mutation flows
- `expo-secure-store` for native access and refresh tokens
- Expo Camera, Document Picker and Image Picker for device features
- Shared design tokens, safe-area layout, keyboard-aware forms and accessible controls

## Requirements

- Node.js `24.6.0` (see `.nvmrc`)
- npm
- Xcode and iOS Simulator for iOS simulator builds, or Android Studio/SDK for Android
- A running GharSync API with the native authentication endpoints described below

## Local development

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

## API and authentication contract

Base URL example: `https://api.example.com/api/v1`.

The native client uses these auth endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/mobile/register` | Create an account and native session |
| `POST` | `/auth/mobile/sign-in` | Sign in and issue mobile-audience tokens |
| `POST` | `/auth/mobile/refresh` | Rotate a refresh session |
| `POST` | `/auth/mobile/sign-out` | Revoke a refresh session |
| `GET` | `/auth/mobile/me` | Load the authenticated user's profile |
| `POST` | `/auth/mobile/organizations/:organizationId/select` | Select a workspace membership |

Authenticated feature requests use `Authorization: Bearer <accessToken>`. The client stores tokens in SecureStore, coalesces concurrent refresh attempts, retries a request once after a 401, and clears local session data if refresh fails. The API must validate the mobile token audience for bearer requests and continue using the web audience for browser sessions. See the API repository's deployment documentation for environment variables and provider setup.

The client serializes JSON automatically and leaves `FormData` boundaries to `fetch` for document and image uploads. API errors surface as readable messages in the relevant screen.

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
- **Native dependency mismatch:** run `npx expo-doctor` and align package versions with the installed Expo SDK.

## Privacy and operational boundaries

- Keep `.env`, signing files, access credentials and API provider keys out of Git.
- File access and tenant authorization are enforced by the API; do not treat client-side role checks as a security boundary.
- AI output is a draft for human review, not a diagnosis or approved quote.
- Payment status changes are recorded through the server's payment ledger; this app does not claim to charge cards without a configured payment processor.
- Production operations still need server monitoring, backups, delivery-provider setup, data retention and incident-response processes.

## Screenshots

No device screenshots are committed yet. Capture current iOS and Android screens from preview builds before adding store marketing images; use real device output and remove customer or workspace personal data before publishing.

## Repository hygiene

`.env`, `node_modules`, Expo cache/output, build directories and TypeScript build artifacts are ignored. Keep the lockfile committed so local and CI dependency resolution stays repeatable.
