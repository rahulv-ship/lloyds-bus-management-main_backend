const express = require("express");

const {
  createApplication,
  createAdminApplication,
  getPendingApplications,
  approveApplication,
  rejectApplication,
  cancelApplication,
  cancelBookingDates,
  getEmployeeApplications,
  sendPassQRCodeEmail,
} = require("../controllers/busPassController");

const {
  authenticate,
  authorize,
} = require("../middleware/auth");

const router = express.Router();


// Employee submits application
router.post(
  "/applications",
  authenticate,
  authorize("EMPLOYEE"),
  createApplication
);

// An administrator can make a special booking on behalf of an active employee.
router.post(
  "/admin/special-bookings",
  authenticate,
  authorize("ADMIN"),
  createAdminApplication
);


// Employee sees own applications
router.get(
  "/my-applications",
  authenticate,
  authorize("EMPLOYEE"),
  getEmployeeApplications
);

router.post(
  "/my-applications/:id/send-qr",
  authenticate,
  authorize("EMPLOYEE"),
  sendPassQRCodeEmail
);

// Employee cancels own application
router.put(
  "/my-applications/:id/cancel",
  authenticate,
  authorize("EMPLOYEE"),
  cancelApplication
);

router.put(
  "/my-applications/:id/dates/cancel",
  authenticate,
  authorize("EMPLOYEE"),
  cancelBookingDates
);

// Super Admin sees pending applications
router.get(
  "/admin/pending",
  authenticate,
  authorize("ADMIN"),
  getPendingApplications
);


// Super Admin approves
router.put(
  "/admin/:id/approve",
  authenticate,
  authorize("ADMIN"),
  approveApplication
);


// Super Admin rejects
router.put(
  "/admin/:id/reject",
  authenticate,
  authorize("ADMIN"),
  rejectApplication
);


module.exports = router;
