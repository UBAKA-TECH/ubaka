# Abelus Backend (Node/Express)

Secure, scalable backend for products, orders, analytics, and reporting.

## Features
- JWT auth and role-based access (admin, customer, etc.)
- Products and Orders with status workflow
- Analytics endpoints (top products, customization usage, status breakdown)
- Unified PDF reports using PDFKit (shared header/footer/signature)
- CSV exports and report logging (with AI summary text)
- Email notifications (Nodemailer)
- Scheduled monthly PDF via node-cron

## Tech stack
- Express, Mongoose
- JWT, bcryptjs
- pdfkit, nodemailer, node-cron
- express-rate-limit, dotenv

## Quick start
```
cd abelus/impressa-backend
npm install
npm run dev
```

Create .env:
```
MONGO_URI=...
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
# Optional
COHERE_API_KEY=...
PORT=5000
```

## Report APIs
- GET /api/orders/report?type=monthly|daily|custom-range|customer|status|revenue&format=pdf|csv
  - Returns PDF (inline) or CSV attachment
- GET /api/orders/report/logs?format=csv (download logs)
- GET /api/reports/generate?type=users&format=pdf|csv

PDF template: utils/pdfLayout.js (helpers.table, header/footer, signature). Scheduled: jobs/scheduledReports.js.

## Structure
```
controllers/
  authController.js
  orderController.js
middleware/
  authMiddleware.js
  rateLimiter.js
models/
  User.js
  Product.js
  Order.js
  ReportLog.js
routes/
  authRoutes.js
  orderRoutes.js
  productRoutes.js
  customizationRoutes.js
  reportRoutes.js
  analyticsRoutes.js
services/
  reportBuilders.js
utils/
  pdfLayout.js
  csvExporter.js
  logCsvExporter.js
  aiSummary.js
  sendReportEmail.js
jobs/
  scheduledReports.js
assets/
  logo.png
server.js
```

## Docs
- See ../../PDF_TEMPLATES_README.md for PDF design and usage
- See ../../REPORT_TROUBLESHOOTING.md for common issues

## License
Proprietary to Abelus Custom Solutions. All rights reserved.
