# Hack2Skill

Hack2Skill is a hackathon MVP for monitoring public infrastructure through a half-step condition scoring system. The platform is designed to help teams detect asset degradation early, trigger maintenance workflows before complete failure, and present district-level health insights through dashboards and reporting tools.

## Problem Statement

Public assets such as roads, streetlights, toilets, benches, hospital lines, and water pumps are often repaired only after full failure. Hack2Skill introduces a fractional scoring model so teams can identify deterioration earlier and act before assets become non-functional.

## Core Idea

Every asset is scored using five fixed values:

- `2.0` = perfect
- `1.5` = minor degradation
- `1.0` = moderate degradation
- `0.5` = severe degradation
- `0.0` = non-functional

Instead of waiting for a binary working/not-working state, the system tracks score drops over time, flags risky decline patterns, and generates alerts or work orders when thresholds are crossed.

## MVP Goals

- Register and manage public assets with location and department data
- Support role-based access for `admin`, `department_officer`, `field_inspector`, and `citizen`
- Record condition reports with score, notes, timestamp, photo, and geolocation
- Trigger alerts and work orders from score-drop rules
- Show district-level degradation summaries and trend insights
- Prepare a strong hackathon demo with seeded sample data and one complete end-to-end scenario

## Current Repository Structure

```text
hack2skill/
  app/        -> main implementation workspace
  frontend/   -> separate Next.js scaffold, currently default starter
```

The `app` folder is the primary project area right now. It already includes the main technical foundation for the MVP:

- Next.js app setup
- Prisma schema for users, departments, assets, reports, alerts, work orders, and district metrics
- NextAuth-based authentication with credentials and optional Google provider wiring
- half-step scoring utilities and alert/work-order evaluation logic

The `frontend` folder is still a default Next.js scaffold and is not the active product implementation.

## Tech Stack

- Frontend: `Next.js 16` + `React 19` + `TypeScript`
- Styling: `Tailwind CSS 4`
- Auth: `NextAuth` with credentials provider and optional Google OAuth
- Database ORM: `Prisma`
- Database target: `PostgreSQL`
- Password hashing: `bcryptjs`
- Charts: `Recharts`
- Map: `Leaflet` + `React-Leaflet`

## Current Implementation Status

Implemented in `app/`:

- login page with demo login, signup flow, and optional Google sign-in
- protected dashboard shell and navigation
- Prisma data model for core entities
- auth configuration for credential login plus optional Google-based account creation
- score validation for allowed half-step values
- alert/work-order evaluation rules for major score drops
- Half-Step Index calculation helpers
- asset list, asset detail, and add-asset flow
- report submission flow with notes, optional photo URL, and GPS fields
- alerts listing with acknowledge/unacknowledge actions
- work-order listing with assignment and status update actions
- interactive map view with district, asset type, and score-band filters
- dashboard filters for district, asset type, and score band
- 90-day rule-based failure watch on the dashboard
- seeded demo data covering users, assets, reports, alerts, and work orders
- asset trend chart based on historical reports

Still pending or incomplete:

- real file upload/storage flow
- CSV export / bulk upload
- dedicated citizen complaint workflow
- public deployment and production polish

## Core Alert Logic

The current scoring utility follows these key rules:

- `1.5 -> 1.0` creates a medium alert
- `1.0 -> 0.5` creates a high alert and a work order
- any drop to `0.0` creates a critical alert and critical work order
- larger rapid drops can also trigger high-priority handling

## Data Model

The Prisma schema currently defines:

- `Department`
- `User`
- `Asset`
- `AssetReport`
- `Alert`
- `WorkOrder`
- `DistrictMetricsDaily`

This matches the hackathon plan closely and provides the base needed for reporting, scoring, alerting, and district-level summaries.

## Suggested Demo Story

The strongest demo path for this project is:

1. Admin or inspector logs in
2. Opens an existing public asset
3. Submits a lower score than the previous report
4. System calculates score delta
5. Alert or work order is generated automatically
6. Dashboard and asset detail view highlight the degrading trend

## Local Setup

### Main App

```bash
cd app
npm install
npm run dev
```

### Secondary Frontend Scaffold

```bash
cd frontend
npm install
npm run dev
```

## Environment Notes

The Prisma setup expects a PostgreSQL connection string through:

```env
DATABASE_URL=postgresql://...
```

For the auth flow, you will also likely need standard NextAuth environment variables when the login flow is completed, such as:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

If you want to enable Google sign-in, you will also need:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true
```

## Recommended Next Steps

- keep `app/` as the single source of truth for the MVP
- either archive or remove the unused `frontend/` scaffold after submission
- replace photo URL input with real upload/storage
- extend the current map and dashboard analytics into richer district-level monitoring
- add export and bulk-upload features only after the demo flow is stable
- prepare one polished judge-facing demo flow before adding optional features

## Submission Priorities

For hackathon delivery, the priority should remain:

- complete one stable end-to-end workflow first
- keep the score-drop logic correct
- seed convincing demo data
- document setup, features, and demo credentials clearly
- polish only after the workflow is reliable

## Project Vision

Hack2Skill is aimed at helping teams move from reactive repair to early intervention. The value of the product is not only in collecting reports, but in turning small drops in asset condition into actionable maintenance signals before public infrastructure reaches failure.
