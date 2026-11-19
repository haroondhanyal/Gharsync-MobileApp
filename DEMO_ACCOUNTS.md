# GharSync simple demo accounts

All 30 local demo accounts use this password:

```text
GharSync123!
```

| Role | Accounts |
| --- | --- |
| Owner | `owner1@gmail.com`, `owner2@gmail.com`, `owner3@gmail.com`, `owner4@gmail.com`, `owner5@gmail.com`, `owner6@gmail.com`, `owner7@gmail.com`, `owner8@gmail.com`, `owner9@gmail.com`, `owner10@gmail.com` |
| Admin | `admin1@gmail.com`, `admin2@gmail.com`, `admin3@gmail.com`, `admin4@gmail.com`, `admin5@gmail.com`, `admin6@gmail.com`, `admin7@gmail.com`, `admin8@gmail.com`, `admin9@gmail.com`, `admin10@gmail.com` |
| Technician | `technician1@gmail.com`, `technician2@gmail.com`, `technician3@gmail.com`, `technician4@gmail.com`, `technician5@gmail.com`, `technician6@gmail.com`, `technician7@gmail.com`, `technician8@gmail.com`, `technician9@gmail.com`, `technician10@gmail.com` |

## Seed the accounts

Start the local GharSync API with the mobile auth routes from [the API patch](./patches/gharsync-api-mobile-auth.patch), then run this from the mobile project:

```sh
npm run seed:demo-accounts
```

The script creates 10 workspaces. Each workspace gets one owner, one admin, and one technician; the admin and technician are invited into that owner’s workspace. It only allows a localhost API and uses the local demo SMS code `123456` for phone verification.

## Seed detailed module data

After seeding accounts, run this from the mobile project to add realistic records to all 10 simple workspaces:

```sh
npm run seed:demo-data
```

Each workspace gets customer profiles with contact preferences, homes and equipment records with a demo image, three service offerings and bookings, a reviewed quote, a completed job with verified invoice payment, stock and a supplier, a warranty claim, and an in-app notification. The seeder is local API only. It follows the configured provider/plan rules for AI, so AI needs to be enabled on the GharSync API to answer chat requests.
