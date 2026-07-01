# HR Attendance & Management Backend

A Zimyo-inspired HRMS backend built with Node.js, Express, and MongoDB. Covers attendance, leave, regularization, half-day, onboarding, exit, insurance tracking, company calendar, KPI reviews, and payslip generation.

## Setup

```bash
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # requires nodemon; or `npm start`
```

Requires a running MongoDB instance (local or Atlas) — set `MONGO_URI` accordingly.

## Roles

- `employee` — self-service actions (clock in/out, apply leave, view own profile/payslips)
- `manager` — everything an employee can do + approve their direct reports' leave/regularization/KPI
- `hr_admin` — full access: onboarding, employee records, exits, insurance, calendar, payslips, all approvals

The **first HR admin account must be created directly in the database** (or temporarily relax the `authorize('hr_admin')` guard on `/api/auth/register` for the very first signup), since registration itself requires an existing HR admin token.

## API Reference

### Auth
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/login` | public |
| POST | `/api/auth/register` | hr_admin |

### Employee Profile / Onboarding-Exit
| Method | Route | Access |
|---|---|---|
| GET | `/api/employees/me` | self |
| PUT | `/api/employees/me` | self |
| GET | `/api/employees/team` | manager |
| GET | `/api/employees` | hr_admin |
| GET | `/api/employees/:id` | hr_admin, manager |
| PUT | `/api/employees/:id` | hr_admin |
| PUT | `/api/employees/:id/exit` | hr_admin |

### Attendance
| Method | Route | Access |
|---|---|---|
| POST | `/api/attendance/clock-in` | self |
| POST | `/api/attendance/clock-out` | self |
| GET | `/api/attendance/me?month=&year=` | self |
| GET | `/api/attendance/employee/:employeeId` | hr_admin, manager |
| PUT | `/api/attendance/:id` | hr_admin |

### Leave (includes half-day via `isHalfDay`/`halfDaySession`)
| Method | Route | Access |
|---|---|---|
| POST | `/api/leaves` | self |
| GET | `/api/leaves/me` | self |
| GET | `/api/leaves/balance` | self |
| PUT | `/api/leaves/:id/cancel` | self |
| GET | `/api/leaves/pending` | hr_admin, manager |
| PUT | `/api/leaves/:id/decision` | hr_admin, manager |
| POST | `/api/leaves/balance` | hr_admin |

### Regularization
| Method | Route | Access |
|---|---|---|
| POST | `/api/regularizations` | self |
| GET | `/api/regularizations/me` | self |
| GET | `/api/regularizations/pending` | hr_admin, manager |
| PUT | `/api/regularizations/:id/decision` | hr_admin, manager |

### Onboarding & Documents
| Method | Route | Access |
|---|---|---|
| POST | `/api/onboarding/:employeeId/init` | hr_admin |
| GET | `/api/onboarding/me` | self |
| GET | `/api/onboarding/:employeeId` | hr_admin, manager |
| PUT | `/api/onboarding/:employeeId/task/:taskId` | self, hr_admin |
| POST | `/api/onboarding/documents` | self, hr_admin |
| GET | `/api/onboarding/documents/:employeeId` | self, hr_admin |
| PUT | `/api/onboarding/documents/:id/verify` | hr_admin |

### Insurance
| Method | Route | Access |
|---|---|---|
| POST | `/api/insurance` | hr_admin |
| GET | `/api/insurance` | hr_admin |
| GET | `/api/insurance/me` | self |
| GET | `/api/insurance/:employeeId` | hr_admin |
| PUT | `/api/insurance/:id` | hr_admin |
| POST | `/api/insurance/:id/claim` | self |
| PUT | `/api/insurance/:id/claim/:claimId` | hr_admin |

### Calendar
| Method | Route | Access |
|---|---|---|
| GET | `/api/calendar?month=&year=` | all |
| POST | `/api/calendar` | hr_admin |
| PUT | `/api/calendar/:id` | hr_admin |
| DELETE | `/api/calendar/:id` | hr_admin |

### KPI
| Method | Route | Access |
|---|---|---|
| POST | `/api/kpi` | hr_admin, manager |
| GET | `/api/kpi/me` | self |
| PUT | `/api/kpi/:id/self-review` | self |
| GET | `/api/kpi/pending-review` | hr_admin, manager |
| PUT | `/api/kpi/:id/manager-review` | hr_admin, manager |

### Payslips (PDF generated via pdfkit, saved to `/generated/payslips`)
| Method | Route | Access |
|---|---|---|
| POST | `/api/payslips` | hr_admin |
| GET | `/api/payslips/me` | self |
| GET | `/api/payslips/me/:id/download` | self |
| GET | `/api/payslips/:employeeId` | hr_admin |

### Excel Export & Bulk Import
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/employees/bulk-import` | hr_admin | Multipart upload, field name `file`. Parses `.xlsx`, creates employee profiles + a default onboarding checklist for each row. See `sample-templates/employee_import_template.xlsx` for the exact column headers expected. Auto-generates a temp password per employee if left blank (returned once in the response — share it securely). |
| GET | `/api/reports/employees/export?department=&status=` | hr_admin | Downloads all employee profile data as `.xlsx` |
| GET | `/api/reports/attendance/export?month=&year=&employeeId=` | hr_admin, manager | Downloads attendance records as `.xlsx` |
| GET | `/api/reports/leaves/export?year=&status=&employeeId=` | hr_admin, manager | Downloads leave request data as `.xlsx` |

**Import template columns** (header row must match, case-insensitive): `Employee ID`, `Name`, `Email`, `Phone`, `Department`, `Designation`, `Role`, `Employment Type`, `Date of Joining`, `Password` (optional).


| Method | Route | Access |
|---|---|---|
| GET | `/api/approvals/inbox` | hr_admin, manager — combines pending leave + half-day + regularization requests in one list, scoped to a manager's direct reports |

## What's intentionally NOT built yet (Phase 2 candidates)

- File upload storage (S3/Cloudinary) — currently documents/attachments expect a `fileUrl` string; wire up `multer` + a storage provider when ready
- Email/push notifications on approval events
- Payroll tax auto-calculation (currently HR enters earnings/deductions manually per payslip)
- Frontend (React web app / React Native mobile app) consuming this API
- Automated leave balance accrual (monthly/yearly credit cron job)
- Geofencing / selfie-based attendance (Zimyo has this — can be added as extra fields + a photo/location check in clock-in)

## Suggested next step

Tell me which piece to build next — the React web frontend (employee + admin dashboards), file upload wiring, or the leave-accrual cron job — and I'll continue directly from this backend.
