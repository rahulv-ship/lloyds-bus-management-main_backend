# Lloyds Metals & Energy — Employee Bus Management System
## Standard Operating Procedure (SOP)

**Version:** 1.0  
**Effective Date:** 2026-10-05  
**Prepared By:** System Administrator  
**Reviewed By:** Transport / HR Operations  
**Approved By:** Management  

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Scope](#2-scope)
3. [System Overview](#3-system-overview)
4. [User Roles & Responsibilities](#4-user-roles--responsibilities)
5. [Access Control & Authentication](#5-access-control--authentication)
6. [Employee Self-Service Operations](#6-employee-self-service-operations)
7. [Booking Rules & Constraints](#7-booking-rules--constraints)
8. [Admin Operations](#8-admin-operations)
9. [Approval Workflow](#9-approval-workflow)
10. [Digital Pass & QR Code](#10-digital-pass--qr-code)
11. [Notification & Alert Management](#11-notification--alert-management)
12. [Master Data Maintenance](#12-master-data-maintenance)
13. [Reports & Audits](#13-reports--audits)
14. [Security & Data Integrity](#14-security--data-integrity)
15. [Incident Handling & Escalation](#15-incident-handling--escalation)
16. [Backup, Recovery & Maintenance](#16-backup-recovery--maintenance)
17. [Change Management](#17-change-management)
18. [Definitions & Abbreviations](#18-definitions--abbreviations)
19. [Appendix — Quick Reference](#19-appendix--quick-reference)

---

## 1. Purpose

This SOP defines the standard procedures for operating and administering the **Lloyds Employee Bus Management System**. It ensures consistent usage of the application for booking, approval, monitoring, and reporting of employee bus transport services.

---

## 2. Scope

This SOP applies to:
- **Employees** using the self-service booking portal
- **Admins / Transport desk** managing approvals, master data, and reports
- **IT / System administrators** maintaining the application, database, and integrations

---

## 3. System Overview

The application is a full-stack web system:

| Layer | Technology | Purpose |
|--------|-----------|---------|
| Frontend | React, Vite, React Router, Axios | User interface |
| Backend | Node.js, Express | APIs and business logic |
| Database | MySQL, Sequelize ORM | Persistent data storage |
| Auth | JWT, Company SSO | Authentication |
| Email | Nodemailer, Gmail SMTP | QR pass delivery |
| Notifications | In-app notification + alert module | Operational alerts |

---

## 4. User Roles & Responsibilities

### 4.1 Employee
- Log in via company SSO
- Book bus passes
- View booking status
- Receive QR pass via email
- View notifications and alerts
- Update profile

### 4.2 Admin / Transport Desk
- Log in via admin credentials
- Approve / reject applications
- Manage master data (buses, routes, stops, shifts)
- Monitor dashboard and alerts
- Generate reports
- Manage billing and GPS tracking

### 4.3 System Administrator
- Maintain backend server and database
- Manage environment configuration
- Run seed and migration scripts
- Monitor application health
- Handle incidents and escalations

---

## 5. Access Control & Authentication

### 5.1 Employee Login
1. Navigate to the application URL.
2. Enter **company SSO email and password**.
3. On successful authentication:
   - JWT token is generated
   - Employee profile is created/updated from SSO and HonoHR
   - If an approved pass exists, **QR code email is sent automatically**

### 5.2 Admin Login
1. Navigate to the application URL.
2. Enter **admin username and password**.
3. On successful authentication:
   - JWT token is generated
   - Admin dashboard is accessible

### 5.3 Session Management
- Employee session: **8 hours**
- Admin session: **8 hours**
- Tokens are stored securely in the frontend session context
- Logout clears the session and token

---

## 6. Employee Self-Service Operations

### 6.1 Book a Bus Pass
1. Log in to the application.
2. Navigate to **Book Bus**.
3. Select:
   - **Source**
   - **Boarding stop**
   - **Shift** (A, B, C, or General)
   - **Travel dates** from the calendar
4. Select an available bus.
5. Submit the application.
6. Wait for admin approval.

### 6.2 View Booking Status
1. Navigate to **My Bookings**.
2. View all applications with status:
   - `PENDING_APPROVAL`
   - `APPROVED`
   - `REJECTED`
   - `CANCELLED`

### 6.3 Cancel Booking Dates
1. Navigate to **My Bookings**.
2. Select an approved application.
3. Click **Cancel dates**.
4. Select dates to cancel.
5. Confirm cancellation.

### 6.4 View Digital Pass
1. Navigate to **My Pass**.
2. View the digital pass with QR code.
3. Use the QR code for bus boarding verification.

### 6.5 View Notifications
1. Click the **notification bell** in the top bar.
2. View unread/read notifications.
3. Click a notification to mark it as read.
4. Use **Mark all read** to clear all notifications.

### 6.6 View Alerts
1. Click the **alert bell** in the top bar.
2. View operational alerts (capacity, booking, security).
3. Click an alert to acknowledge it.
4. Use **Acknowledge all** to clear all alerts.
5. Navigate to **Alerts** page for full history.

---

## 7. Booking Rules & Constraints

### 7.1 General Rules
- An employee can have **only one** `PENDING_APPROVAL` or `APPROVED` application at a time.
- Booking must be made **at least before the travel date**.
- Weekly off dates are locked as holidays and cannot be selected.

### 7.2 Shift-Based Booking
| Shift | Timing | Operational Routes |
|-------|--------|-------------------|
| A | 04:55 - 05:55 | SHIFT-A |
| B | 12:50 - 13:55 | SHIFT-B |
| C | 20:50 - 21:55 | SHIFT-C |
| General | Flexible | Numbered routes |

### 7.3 Capacity Rules
- Each bus has a fixed capacity (default: **52 seats**).
- `PENDING_APPROVAL` and `APPROVED` applications occupy seats.
- `REJECTED` and `CANCELLED` applications do not occupy seats.
- If any selected date is fully booked, the **entire booking is rejected**.

### 7.4 Unauthorized Travel Detection
- An employee cannot book a **different bus** on a date they already have an approved booking.
- Attempting to do so triggers a **security alert**.

---

## 8. Admin Operations

### 8.1 Dashboard
1. Log in as admin.
2. View dashboard with:
   - Total buses, active buses, routes, active routes
   - Pending applications count
   - Bus utilization (booked, available, percentage)
   - Operational alerts (full, high occupancy, unused capacity)

### 8.2 Approve / Reject Applications
1. Navigate to **Approvals**.
2. View pending applications in a calendar view.
3. Click an application to view details.
4. Approve or reject with optional notes.
5. On approval:
   - Pass number and QR token are generated
   - QR code email is sent to the employee
   - Application status changes to `APPROVED`

### 8.3 Special Booking
1. Navigate to **Special booking**.
2. Select employee, source, boarding stop, shift, dates, and bus.
3. Submit the booking.
4. Follow the same approval workflow.

---

## 9. Approval Workflow

```
Employee submits application
        |
        v
Status: PENDING_APPROVAL
        |
        v
Admin reviews application
        |
        +---> Approve ---> Status: APPROVED ---> QR email sent
        |
        +---> Reject ---> Status: REJECTED
```

### 9.1 Approval Criteria
- Bus is active and has capacity for all selected dates.
- Employee is active and has no conflicting bookings.
- Route and shift are active.

### 9.2 Rejection Criteria
- Bus is fully booked.
- Employee has an existing active application.
- Invalid stops or bus assignment.

---

## 10. Digital Pass & QR Code

### 10.1 Pass Generation
- On approval, a **pass number** and **QR token** are generated.
- Pass validity is derived from the selected booking dates.

### 10.2 QR Code Email
- QR code email is sent automatically:
  - **On approval** by admin
  - **On login** if employee has an approved pass
- Email contains:
  - Pass details (employee, route, bus, shift, pickup, drop, validity)
  - QR code image

### 10.3 Boarding Verification
- Scan the QR code at the bus.
- Verify pass details against the booking.

---

## 11. Notification & Alert Management

### 11.1 Notifications
- System-generated messages for employees.
- Types:
  - `BUS_STATUS_CHANGE` — bus status updates (INACTIVE, BREAKDOWN, etc.)
  - `BOOKING_UPDATE` — booking approval/rejection
  - `SYSTEM` — welcome messages, announcements

### 11.2 Alerts
- Operational alerts for capacity, booking, and security.
- Types:
  - `BUS_FULLY_BOOKED` — no seats available
  - `HIGH_OCCUPANCY` — occupancy >= 85%
  - `UNUSED_CAPACITY` — occupancy <= 25%
  - `MULTIPLE_BOOKING` — employee attempts multiple bookings
  - `UNAUTHORIZED_TRAVEL` — employee books different bus on same date
- Severity levels:
  - `INFO` — informational
  - `WARNING` — requires attention
  - `CRITICAL` — immediate action required

### 11.3 Alert Acknowledgment
- Alerts can be acknowledged individually or in bulk.
- Acknowledged alerts are marked with timestamp and user ID.

---

## 12. Master Data Maintenance

### 12.1 Manageable Entities
- Buses
- Routes
- Stops
- Shifts
- Bus Routes (bus-route-shift assignments)
- Bus Route Stops (stop sequence, pickup/drop permissions)

### 12.2 Procedures
1. Navigate to **Master data**.
2. Select the entity to manage.
3. Create, edit, or delete records.
4. Ensure referential integrity (e.g., a bus route requires bus, route, and shift).

### 12.3 Import Bus Routes
1. Prepare the CSV/Excel file with route data.
2. Run the import script:
   ```bash
   npm run import:routes
   ```
3. Verify the imported data in the Master data section.

---

## 13. Reports & Audits

### 13.1 Master Report
1. Navigate to **Master report**.
2. Export data in Excel format.
3. Includes: buses, routes, stops, shifts, vendors, drivers, conductors, services.

### 13.2 Dashboard Utilization
- View real-time bus utilization.
- Identify fully booked, high occupancy, and unused capacity buses.

---

## 14. Security & Data Integrity

### 14.1 Authentication
- All API routes are protected with JWT authentication.
- Rate limiting is applied:
  - Global: 100 requests per 15 minutes
  - Auth routes: 10 requests per 15 minutes

### 14.2 Authorization
- Role-based access control:
  - `EMPLOYEE` — self-service operations
  - `ADMIN` — administrative operations

### 14.3 Data Validation
- Backend validates all inputs.
- Capacity checks prevent overbooking.
- Unauthorized travel detection prevents conflicting bookings.

### 14.4 Error Handling
- Backend returns structured JSON responses.
- Frontend displays errors via modal dialogs.
- No raw stack traces are exposed to users.

---

## 15. Incident Handling & Escalation

### 15.1 Incident Categories
- **Login failure** — SSO or admin authentication issues
- **Booking failure** — capacity, validation, or system errors
- **Email failure** — QR code not delivered
- **Data error** — incorrect master data
- **System downtime** — server or database unavailable

### 15.2 Escalation Matrix

| Incident | Level 1 | Level 2 | Level 3 |
|---------|---------|---------|---------|
| Login issue | Employee / Admin | IT Support | System Admin |
| Booking issue | Employee | Transport Desk | IT Support |
| Email issue | Employee | Transport Desk | IT Support |
| Data error | Transport Desk | IT Support | System Admin |
| System down | All users | IT Support | System Admin |

### 15.3 Incident Logging
- Log all incidents with:
  - Timestamp
  - User ID
  - Error description
  - Steps taken
  - Resolution

---

## 16. Backup, Recovery & Maintenance

### 16.1 Database Backup
- Perform regular MySQL backups.
- Store backups securely offsite.

### 16.2 Application Maintenance
- Schedule maintenance during non-peak hours.
- Notify users in advance.
- Restart services after updates.

### 16.3 Seed & Migration Scripts
| Script | Purpose | Command |
|--------|---------|---------|
| `seedAdmin.js` | Create admin user | `node src/seedAdmin.js` |
| `seedShiftRoutes.js` | Seed SHIFT-A/B/C routes | `npm run seed:shift-routes` |
| `seedNotifications.js` | Seed sample notifications | `node src/scripts/seedNotifications.js` |
| `seedAlerts.js` | Seed sample alerts | `npm run seed:alerts` |
| `importBusRoutes.js` | Import bus routes from file | `npm run import:routes` |
| `addBusMasterFields.js` | Migrate bus master fields | `npm run migrate:bus-master` |

---

## 17. Change Management

### 17.1 Change Request Process
1. Submit change request with justification.
2. Review by transport and IT teams.
3. Approve by management.
4. Implement in test environment.
5. Test and validate.
6. Deploy to production.
7. Document the change.

### 17.2 Version Control
- All code changes are tracked in Git.
- Follow branching strategy:
  - `main` — production
  - `develop` — staging
  - Feature branches for new developments

---

## 18. Definitions & Abbreviations

| Term | Definition |
|------|-----------|
| SSO | Single Sign-On |
| QR | Quick Response (code) |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| SMTP | Simple Mail Transfer Protocol |
| SPA | Single Page Application |
| Route | Bus service path with source and destination |
| Shift | Scheduled bus timing (A, B, C, General) |
| Bus Route | Assignment of a bus to a route and shift |
| Pass | Approved bus pass with QR token |
| Alert | Operational notification (capacity, booking, security) |
| Notification | System message (booking, bus status, system) |

---

## 19. Appendix — Quick Reference

### 19.1 Application URLs
| Environment | URL |
|------------|-----|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000` |
| Health Check | `http://localhost:5000/api/health` |

### 19.2 Important API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/employee-sso` | Employee SSO login |
| GET | `/api/master/available-buses` | Get available buses |
| POST | `/api/bus-pass/applications` | Create booking |
| PUT | `/api/bus-pass/applications/:id/approve` | Approve booking |
| PUT | `/api/bus-pass/applications/:id/reject` | Reject booking |
| PUT | `/api/bus-pass/my-applications/:id/dates/cancel` | Cancel dates |
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark notification read |
| GET | `/api/alerts` | Get alerts |
| PUT | `/api/alerts/:id/acknowledge` | Acknowledge alert |

### 19.3 Default Credentials
| Role | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `Admin@123` |

### 19.4 Support Contacts
| Support Type | Contact |
|-------------|---------|
| Application Issues | IT Helpdesk |
| Transport / Booking | Transport Desk |
| Email / QR Issues | IT Support |
| Emergency | System Administrator |

---

**End of Document**
