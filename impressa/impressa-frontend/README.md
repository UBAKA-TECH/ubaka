# Abelus Frontend (React)

Admin dashboard and reports UI.

## Quick start
```
cd abelus/abelus-frontend
npm install
npm start
```

The app expects the backend at http://localhost:5000/api (see src/utils/axiosInstance.js).

## Reports page
- Page: src/pages/AdminReports.jsx
- Generates reports by calling GET /api/orders/report with type and format
- For PDF it opens a new tab; for CSV it downloads a file

## Notable components
- src/components/PDFReportTemplate.jsx – optional client-side HTML→PDF layout
- src/components/Sidebar.jsx, Topbar.jsx – navigation

## Build
- npm run build – production bundle

## Troubleshooting
See ../../REPORT_TROUBLESHOOTING.md
