# Half-Step India
 
> **AI-powered public infrastructure monitoring for early intervention — before assets fail.**
 
![Half-Step India Dashboard](./app/screenshots/dashboard.png)
 
---
 
## The Problem
 
India's public infrastructure — roads, streetlights, water lines, toilets, benches — is repaired only after complete failure. By then, the cost is higher, the impact on citizens is worse, and the damage is harder to reverse.
 
There is no widely used system that tracks *gradual* degradation, alerts the right departments proactively, or gives decision-makers a real-time view of infrastructure health across districts.
 
**Half-Step India was built to change that.**
 
---
 
## What It Does
 
Half-Step India is a full-stack infrastructure monitoring platform that introduces a **fractional condition scoring model** — so teams can detect asset deterioration early and act before things break down completely.
 
Every public asset is tracked on a five-point health scale:
 
| Score | Condition |
|-------|-----------|
| `2.0` | Perfect |
| `1.5` | Minor Degradation |
| `1.0` | Moderate Degradation |
| `0.5` | Severe Degradation |
| `0.0` | Non-Functional |
 
When scores drop across reports, the system automatically triggers **alerts** and **work orders** — pushing maintenance signals to the right people before assets reach failure.
 
---
 
## Key Features
 
### 📊 Live Dashboard
Real-time overview of asset health across all districts. Filter by district, asset type, and score band. Includes a 90-day failure watch for assets trending downward.
 
### 🗺️ Interactive Asset Map
Visualise every monitored asset on a Leaflet-powered map with colour-coded health indicators — green (healthy) to red (critical).
 
### 📋 Asset Management
Add, view, and manage public assets with full metadata: department, location, type, and historical score trends.
 
### 🔔 Smart Alerts
Automated alerts fire when score thresholds are crossed:
- `1.5 → 1.0` → Medium alert
- `1.0 → 0.5` → High alert + Work Order
- Any drop to `0.0` → Critical alert + Critical Work Order
### 📝 Condition Reports
Field inspectors and citizens can submit condition reports with notes, photo links, GPS coordinates, and timestamped scores.
 
### 🔧 Work Orders
Automatically generated or manually created work orders with assignment, priority tracking, and status updates.
 
### 👥 Role-Based Access
Four roles with scoped permissions: `admin`, `department_officer`, `field_inspector`, and `citizen`.
 
---
 
## Screenshots
 
| Login | Dashboard | Asset Map |
|-------|-----------|-----------|
| ![Login](./app/screenshots/login.png) | ![Dashboard](./app/screenshots/dashboard.png) | ![Map](./app/screenshots/map.png) |
 
| Assets | Reports | Alerts |
|--------|---------|--------|
| ![Assets](./app/screenshots/assets.png) | ![Reports](./app/screenshots/reports.png) | ![Alerts](./app/screenshots/alerts.png) |
 
---
 
## Tech Stack
 
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Auth | NextAuth (Credentials + Google OAuth) |
| ORM | Prisma |
| Database | PostgreSQL |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| Password Hashing | bcryptjs |
 
---
 
## Getting Started
 
### Prerequisites
 
- Node.js 18+
- PostgreSQL database
### 1. Clone the repository
 
```bash
git clone https://github.com/Mr-dhruv-sony/Half-Step-India.git
cd Half-Step-India
```
 
### 2. Install dependencies
 
```bash
cd app
npm install
```
 
### 3. Configure environment variables
 
Create a `.env` file in the `app/` directory:
 
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/halfstepindia
 
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```
 
To enable Google OAuth (optional):
 
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true
```
 
### 4. Set up the database
 
```bash
npx prisma migrate dev
npx prisma db seed
```
 
### 5. Run the development server
 
```bash
npm run dev
```
 
Visit [http://localhost:3000](http://localhost:3000)
 
### Demo Login
 
Use the **Demo Login** button on the login page to explore the platform with pre-seeded data — no account creation needed.
 
---
 
## Data Model
 
```
Department
User              (admin / department_officer / field_inspector / citizen)
Asset             (location, type, department, current score)
AssetReport       (score, notes, photo, GPS, timestamp)
Alert             (severity, status, trigger rule)
WorkOrder         (priority, assignment, status)
DistrictMetricsDaily
```
  
## Project Vision
 
Half-Step India is built on a simple belief: **small drops in condition are signals, not noise.**
 
The goal is to help governments and municipalities move from reactive repair cycles to early intervention — using real data from the ground to act before public assets fail and before citizens are affected.
 
Infrastructure degradation doesn't happen overnight. Half-Step India makes sure we don't miss the warning signs.
 
---
 
## Team
 
Built with ❤️ by **Dhruv Sony**, **Raj**, and **Sanjana**
 
---
 
## License

 
[MIT](./LICENSE)
 
