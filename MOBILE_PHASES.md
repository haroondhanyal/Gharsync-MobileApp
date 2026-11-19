# GharSync Mobile · Phases 1–10

Mobile scope is a native companion to the existing web/API product. Every business record is fetched from the shared versioned API; authorization and tenant boundaries stay on the server.

| Phase | Mobile coverage | Main app areas |
|---|---|---|
| 1 · Foundation | Standalone Expo Router app, strict TypeScript, shared GharSync tokens, safe-area/keyboard layouts, accessible controls, query loading/error/empty states and platform bundle support. | App shell, side drawer, shared UI kit |
| 2 · Identity and tenancy | Native access/rotating refresh sessions in SecureStore, business sign-up, OTP, recovery, sign-out, organization selection/setup, invite acceptance, team invitations/members, branches and session revocation. | Auth, workspace setup, team, branches, profile, security |
| 3 · Business and CRM | Live organization dashboard and metrics, warranty alert, customer search/create, booking shortcuts and recent activity. | Overview, customers |
| 4 · Homes and assets | Properties and asset registration, customer/property selection, private document/photo attachment, warranty visibility and camera QR resolution. | Properties, assets, documents, QR scanner |
| 5 · Service workflows | Booking creation and filtering, lifecycle/status transitions, booking details, quote drafting/sending, invoice creation, invoice details, pending payment recording and verified/rejected ledger decisions. | Bookings, booking detail, services, invoices |
| 6 · Workforce | Technician roster, skills/availability/workload view, self profile, weekday schedule and manager-reviewed time-off requests. | Workforce, technician availability |
| 7 · Inventory and warranty | Product and supplier catalog, branch stock movement receipts/adjustments/transfers/consumption, warranty claims and resolution. | Inventory, suppliers, stock activity, warranty |
| 8 · Communications and AI | In-app inbox/read state, composed workspace updates, provider status, AI provider/entitlement status, human-reviewed drafts and multimodal Help Desk attachments. | Notifications, assistant, AI usage, Help Desk |
| 9 · SaaS and platform | Current plan/usage, honest plan request workflow, allowlist-protected platform overview, organizations/users/plans/tickets/audit views. | Billing, platform console |
| 10 · Release readiness | Session and password management, role-aware server errors, private token storage, platform-specific compilation, safe areas, accessible labels, pull-to-refresh and deployment notes. | Security, profile, all screens |

## API additions for native auth

The web repository contains additive API support for:

- `POST /mobile/register` and `POST /mobile/sign-in` — issue access and refresh tokens with `gharsync-mobile` access-token audience.
- `POST /mobile/refresh` and `POST /mobile/sign-out` — rotate or revoke a native refresh session.
- `GET /mobile/me` — fetch the current profile, including during OTP verification.
- `POST /mobile/organizations/:organizationId/select` — select a membership and return its new mobile-audience access token.

The companion API changes, including explicit web/mobile access and refresh audiences, are recorded in [`patches/gharsync-api-mobile-auth.patch`](./patches/gharsync-api-mobile-auth.patch). JWT bearer requests carry the native audience; browser cookie requests retain the existing web audience and routes.

## Release boundary

The mobile app consumes the current API and does not duplicate database or business rules. Production readiness still depends on the server operator's SMS/email, durable document storage, push/WhatsApp providers, monitoring/backups and payment-provider setup documented in the web deployment runbook. No native payment charging is presented as available until a payment processor is integrated.
