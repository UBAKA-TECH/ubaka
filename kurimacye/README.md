# IMPRESSA - Technical Overview

This directory contains the core implementation of the Impressa Platform, divided into a high-performance backend and a modern React-based frontend.

## 🏗️ Architecture

The project follows a decoupled client-server architecture:

- **Frontend (`impressa-frontend`)**: A React 19 single-page application (SPA) optimized for both desktop POS usage and mobile customer browsing.
- **Backend (`impressa-backend`)**: An Express 5 REST API utilizing Prisma ORM for type-safe database interactions with Supabase (PostgreSQL).

## 🚀 Key Modules

### 1. Unified POS & Shift Management
Located in `impressa-frontend/src/pages/SellerPOS.jsx` and `impressa-backend/routes/shiftRoutes.js`.
- Implements strict cash control.
- Integrates expense recording within active shifts.
- Provides real-time reconciliation reports.

### 2. Abonne & Credit System
Located in `impressa-frontend/src/pages/SellerAbonne.jsx` and `impressa-backend/routes/abonneRoutes.js`.
- Manages customer credits and subscriptions.
- Features detailed transaction logs and "Collected By" auditing.

### 3. Professional Reporting Engine
Located in `impressa-backend/controllers/reportController.js`.
- Generates high-fidelity PDF reports for shifts, orders, and finance.
- Uses `pdfkit` for precise layout control.

### 4. Strategic Owner Dashboard
Located in `impressa-frontend/src/pages/admin/OwnerOverview.jsx`.
- Aggregates multi-vendor data into actionable business intelligence.
- Features complex chart visualizations via `Chart.js`.

## 🛠️ Tech Stack Refresher

- **Frontend**: React 19, React Router 7, Tailwind CSS, Chart.js.
- **Backend**: Express 5, Prisma, Pino Logging.
- **Database**: Supabase (PostgreSQL).
- **Media**: Cloudinary.

## 📖 Related Documentation
- [Root README](../README.md) - For a high-level project overview and setup instructions.
- [Prisma Schema](./impressa-backend/prisma/schema.prisma) - For the database structure.

---
*Impressa: Scaling Business with Intelligence.*
