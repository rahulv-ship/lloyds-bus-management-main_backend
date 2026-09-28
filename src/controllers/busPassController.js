const crypto = require("crypto");
const { Op } = require("sequelize");
const { fetchHonoHrEmployee } = require('../services/honoHrEmployeeService');
const { sendQRCodeEmail } = require('../services/emailService');

const {
  BusPassApplication,
  BusPassBookingDate,
  Employee,
  Bus,
  BusRoute,
  BusRouteStop,
  Route,
  Shift,
  Stop,
} = require("../models");

// =====================================================
// Constants
// =====================================================

const BUS_CAPACITY = 52;

// =====================================================
// Generators
// =====================================================

const generateApplicationNumber = () => {
  const year = new Date().getFullYear();

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `BP-${year}-${random}`;
};

const generatePassNumber = () => {
  const year = new Date().getFullYear();

  const random = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `PASS-${year}-${random}`;
};

const generateQRToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// =====================================================
// Helpers
// =====================================================

const isValidDateString = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
};

const normalizeBookingDates = (bookingDates) => {
  if (!Array.isArray(bookingDates)) {
    return [];
  }

  return [
    ...new Set(
      bookingDates
        .map((date) => String(date).trim())
        .filter(Boolean)
    ),
  ].sort();
};

// =====================================================
// Employee submits bus pass application
// =====================================================

const createApplication = async (req, res) => {
  try {
    const {
      route_id,
      shift_id,
      bus_id,
      pickup_stop_id,
      drop_stop_id,
      booking_dates,
    } = req.body;

    // -------------------------------------------------
    // Basic validation
    // -------------------------------------------------

    if (
      !route_id ||
      !shift_id ||
      !bus_id ||
      !pickup_stop_id ||
      !drop_stop_id
    ) {
      return res.status(400).json({
        success: false,
        message: "All bus pass details are required",
      });
    }

    // -------------------------------------------------
    // Booking date validation
    // -------------------------------------------------

    const uniqueBookingDates =
      normalizeBookingDates(booking_dates);

    if (uniqueBookingDates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one booking date is required",
      });
    }

    for (const date of uniqueBookingDates) {
      if (!isValidDateString(date)) {
        return res.status(400).json({
          success: false,
          message: `Invalid booking date: ${date}`,
        });
      }
    }

    // -------------------------------------------------
    // Employee from logged-in SSO user
    // -------------------------------------------------

    // An admin special booking is tied to the employee selected by the admin.
    // Employee bookings remain tied to the authenticated employee account.
    const employeeId = req.isAdminBooking
      ? req.body.employee_code
      : req.user.employee_id;

    if (!employeeId) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not linked to an employee record",
      });
    }

    let employee = await Employee.findOne({
      where: {
        employee_code: employeeId,
        status: "ACTIVE",
      },
    });

    if (!employee && req.isAdminBooking) {
      try {
        const honoEmployee = await fetchHonoHrEmployee(employeeId);
        if (honoEmployee) {
          if (!honoEmployee.employee_name) {
            return res.status(502).json({ success: false, message: 'HonoHR returned incomplete employee details. Please contact transport support.' });
          }
          const existingEmployee = await Employee.findOne({ where: { employee_code: honoEmployee.employee_code } });
          employee = existingEmployee
            ? await existingEmployee.update({ ...honoEmployee, status: 'ACTIVE' })
            : await Employee.create({ ...honoEmployee, status: 'ACTIVE' });
        }
      } catch (error) {
        console.error('HonoHR employee lookup failed:', error.message);
        const message = error.code === 'HONO_HR_TOKEN_INVALID'
          ? 'HonoHR integration token has expired or is invalid. Please update the backend HonoHR token.'
          : 'Unable to verify the employee with HonoHR. Please try again or contact transport support.';
        return res.status(502).json({ success: false, message });
      }
    }

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Active employee not found",
      });
    }

    // -------------------------------------------------
    // Validate route
    // -------------------------------------------------

    const route = await Route.findByPk(route_id);

    if (!route || route.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Selected route is not active",
      });
    }

    // -------------------------------------------------
    // Validate shift
    // -------------------------------------------------

    const shift = await Shift.findByPk(shift_id);

    if (!shift || shift.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Selected shift is not active",
      });
    }

    // -------------------------------------------------
    // Validate pickup and drop stops
    // -------------------------------------------------

    const pickup = await Stop.findByPk(pickup_stop_id);
    const drop = await Stop.findByPk(drop_stop_id);

    if (!pickup || !drop) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup or drop stop",
      });
    }

    if (pickup.id === drop.id) {
      return res.status(400).json({
        success: false,
        message:
          "Pickup and drop point cannot be the same",
      });
    }

    // -------------------------------------------------
    // Validate bus
    // -------------------------------------------------

    const bus = await Bus.findByPk(bus_id);

    if (!bus || bus.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Selected bus is not active",
      });
    }

    // -------------------------------------------------
    // Validate bus + route + shift assignment
    // -------------------------------------------------

    const service = await BusRoute.findOne({
      where: {
        route_id,
        shift_id,
        bus_id,
        status: "ACTIVE",
      },

      include: [
        {
          model: BusRouteStop,
          as: "stops",
          attributes: [
            "stop_id",
            "stop_sequence",
            "pickup_allowed",
            "drop_allowed",
          ],
        },
      ],
    });

    if (!service) {
      return res.status(400).json({
        success: false,
        message:
          "The selected bus is not assigned to this route and shift",
      });
    }

    // -------------------------------------------------
    // Validate pickup stop
    // -------------------------------------------------

    const pickupPoint = service.stops.find(
      (stop) =>
        String(stop.stop_id) ===
          String(pickup_stop_id) &&
        stop.pickup_allowed
    );

    // -------------------------------------------------
    // Validate drop stop
    // -------------------------------------------------

    const dropPoint = service.stops.find(
      (stop) =>
        String(stop.stop_id) ===
          String(drop_stop_id) &&
        stop.drop_allowed
    );

    if (
      !pickupPoint ||
      !dropPoint ||
      pickupPoint.stop_sequence >= dropPoint.stop_sequence
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Pickup and drop stops are not valid for the selected service",
      });
    }

    // -------------------------------------------------
    // Prevent employee from having another active
    // application
    // -------------------------------------------------

    const existingApplication =
      await BusPassApplication.findOne({
        where: {
          employee_id: employeeId,
          status: {
            [Op.in]: [
              "PENDING_APPROVAL",
              "APPROVED",
            ],
          },
        },
      });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message:
          "Employee already has a pending or approved bus pass application",
        application_number:
          existingApplication.application_number,
      });
    }

    // -------------------------------------------------
    // DATE-WISE BUS CAPACITY VALIDATION
    //
    // Every bus = 52 seats
    //
    // PENDING_APPROVAL + APPROVED both occupy seats.
    // REJECTED/CANCELLED do not occupy seats.
    // -------------------------------------------------

    const fullDates = [];
    const dateCapacity = [];

    for (const bookingDate of uniqueBookingDates) {
      const bookedCount =
        await BusPassBookingDate.count({
          where: {
            booking_date: bookingDate,
            status: "BOOKED",
          },

          include: [
            {
              model: BusPassApplication,
              as: "application",
              required: true,

              where: {
                bus_id,
                route_id,
                shift_id,

                status: {
                  [Op.in]: [
                    "PENDING_APPROVAL",
                    "APPROVED",
                  ],
                },
              },
            },
          ],
        });

      const remaining =
        BUS_CAPACITY - bookedCount;

      dateCapacity.push({
        date: bookingDate,
        capacity: BUS_CAPACITY,
        booked: bookedCount,
        remaining,
      });

      if (remaining <= 0) {
        fullDates.push(bookingDate);
      }
    }

    // -------------------------------------------------
    // If any selected date is full, reject entire booking
    // -------------------------------------------------

    if (fullDates.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Selected bus does not have capacity for all selected dates",

        full_dates: fullDates,

        capacity: BUS_CAPACITY,

        date_wise_capacity: dateCapacity,
      });
    }

    // -------------------------------------------------
    // Pass validity is automatically derived from
    // selected booking dates
    // -------------------------------------------------

    const sortedDates = [
      ...uniqueBookingDates,
    ].sort();

    const passValidFrom = sortedDates[0];
    const passValidTo =
      sortedDates[sortedDates.length - 1];

    // -------------------------------------------------
    // Create application
    // -------------------------------------------------

    const application =
      await BusPassApplication.create({
        application_number:
          generateApplicationNumber(),

        employee_id: employeeId,

        bus_id,
        route_id,
        shift_id,

        pickup_stop_id,
        drop_stop_id,

        status: "PENDING_APPROVAL",

        submitted_at: new Date(),

        pass_valid_from: passValidFrom,
        pass_valid_to: passValidTo,
      });

    // -------------------------------------------------
    // Create individual booking-date records
    // -------------------------------------------------

    await BusPassBookingDate.bulkCreate(
      uniqueBookingDates.map((date) => ({
        bus_pass_application_id:
          application.id,

        booking_date: date,

        status: "BOOKED",
      }))
    );

    // -------------------------------------------------
    // Return application with booking dates
    // -------------------------------------------------

    const createdApplication =
      await BusPassApplication.findByPk(
        application.id,
        {
          include: [
            {
              model: BusPassBookingDate,
              as: "booking_dates",
              order: [["booking_date", "ASC"]],
            },
          ],
        }
      );

    return res.status(201).json({
      success: true,

      message:
        "Bus pass application submitted successfully",

      application: createdApplication,

      booking_dates: uniqueBookingDates,

      pass_valid_from: passValidFrom,

      pass_valid_to: passValidTo,

      capacity: BUS_CAPACITY,

      date_wise_capacity: dateCapacity,
    });
  } catch (error) {
    console.error(
      "Create bus pass application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit bus pass application",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// Admin creates a special booking using the same validation and capacity rules.
const createAdminApplication = (req, res) => {
  req.isAdminBooking = true;
  return createApplication(req, res);
};

// =====================================================
// Super Admin - Pending applications
// =====================================================

const getPendingApplications = async (
  req,
  res
) => {
  try {
    const applications =
      await BusPassApplication.findAll({
        where: {
          status: "PENDING_APPROVAL",
        },

        include: [
          {
            model: Employee,
            as: "employee",
            attributes: [
              "id",
              "employee_code",
              "employee_name",
              "department",
              "designation",
              "email",
              "mobile",
              "photograph",
            ],
          },

          {
            model: Bus,
            as: "bus",
          },

          {
            model: Route,
            as: "route",
          },

          {
            model: Shift,
            as: "shift",
          },

          {
            model: Stop,
            as: "pickupStop",
          },

          {
            model: Stop,
            as: "dropStop",
          },

          {
            model: BusPassBookingDate,
            as: "booking_dates",
            order: [["booking_date", "ASC"]],
          },
        ],

        order: [
          ["submitted_at", "ASC"],
        ],
      });

    return res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      "Get pending applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch pending applications",
    });
  }
};

// =====================================================
// Super Admin - Approve application
// =====================================================

const approveApplication = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      approved_notes,
    } = req.body;

    const application =
      await BusPassApplication.findByPk(id, {
        include: [
          {
            model: BusPassBookingDate,
            as: "booking_dates",
          },
        ],
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      application.status !==
      "PENDING_APPROVAL"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending applications can be approved",
      });
    }

    // -------------------------------------------------
    // Validate date-wise capacity again before approval
    //
    // This is important because another employee may
    // have booked seats after this application was made.
    // -------------------------------------------------

    const bookingDates =
      application.booking_dates || [];

    const capacityConflicts = [];

    for (const bookingDateRecord of bookingDates) {
      const bookingDate =
        bookingDateRecord.booking_date;

      const usedSeats =
        await BusPassBookingDate.count({
          where: {
            booking_date: bookingDate,
            status: "BOOKED",
          },

          include: [
            {
              model: BusPassApplication,
              as: "application",
              required: true,

              where: {
                bus_id: application.bus_id,
                route_id: application.route_id,
                shift_id: application.shift_id,

                status: {
                  [Op.in]: [
                    "PENDING_APPROVAL",
                    "APPROVED",
                  ],
                },
              },
            },
          ],
        });

      // The current application is already included
      // because its status is PENDING_APPROVAL.
      if (usedSeats > BUS_CAPACITY) {
        capacityConflicts.push({
          date: bookingDate,
          capacity: BUS_CAPACITY,
          booked: usedSeats,
          remaining: 0,
        });
      }
    }

    if (capacityConflicts.length > 0) {
      return res.status(409).json({
        success: false,

        message:
          "Bus capacity has been exceeded for one or more booking dates",

        capacity: BUS_CAPACITY,

        conflicts: capacityConflicts,
      });
    }

    // -------------------------------------------------
    // Generate pass and QR
    // -------------------------------------------------

    const passNumber =
      generatePassNumber();

    const qrToken =
      generateQRToken();

    // -------------------------------------------------
    // Keep validity based on actual selected dates
    // -------------------------------------------------

    const sortedDates = bookingDates
      .map(
        (item) => item.booking_date
      )
      .sort();

    const passValidFrom =
      sortedDates.length > 0
        ? sortedDates[0]
        : application.pass_valid_from;

    const passValidTo =
      sortedDates.length > 0
        ? sortedDates[sortedDates.length - 1]
        : application.pass_valid_to;

    // -------------------------------------------------
    // Approve application
    // -------------------------------------------------

    await application.update({
      status: "APPROVED",

      approved_at: new Date(),

      approved_by: req.user.id,

      pass_number: passNumber,

      pass_valid_from: passValidFrom,

      pass_valid_to: passValidTo,

      qr_token: qrToken,

      qr_generated_at: new Date(),

      approved_notes:
        approved_notes || null,
    });

    const approvedApplication =
      await BusPassApplication.findByPk(
        application.id,
        {
          include: [
            {
              model: Employee,
              as: "employee",
              attributes: [
                "id",
                "employee_code",
                "employee_name",
                "department",
                "designation",
                "email",
                "mobile",
                "photograph",
              ],
            },

            {
              model: Bus,
              as: "bus",
            },

            {
              model: Route,
              as: "route",
            },

            {
              model: Shift,
              as: "shift",
            },

            {
              model: Stop,
              as: "pickupStop",
            },

            {
              model: Stop,
              as: "dropStop",
            },

            {
              model: BusPassBookingDate,
              as: "booking_dates",
              order: [
                ["booking_date", "ASC"],
              ],
            },
          ],
        }
      );

    const employee = approvedApplication?.employee

    if (employee?.email) {
      try {
        const pass = {
          token: qrToken,
          passNumber,
          employeeName: employee.employee_name,
          employeeCode: employee.employee_code,
          department: employee.department,
          routeNumber: approvedApplication.route?.route_number,
          routeName: approvedApplication.route?.route_name,
          busNumber: approvedApplication.bus?.bus_number,
          shiftName: approvedApplication.shift?.shift_name,
          pickupName: approvedApplication.pickupStop?.stop_name,
          dropName: approvedApplication.dropStop?.stop_name,
          validFrom: passValidFrom,
          validTo: passValidTo,
        }

        await sendQRCodeEmail({
          to: employee.email,
          pass,
        })
      } catch (emailError) {
        console.error('Failed to send QR email on approval:', emailError)
      }
    }

    return res.json({
      success: true,

      message:
        "Bus pass application approved successfully",

      application: approvedApplication,
    });
  } catch (error) {
    console.error(
      "Approve application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to approve bus pass application",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// Super Admin - Reject application
// =====================================================

const rejectApplication = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      rejection_reason,
    } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message:
          "Rejection reason is required",
      });
    }

    const application =
      await BusPassApplication.findByPk(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      application.status !==
      "PENDING_APPROVAL"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending applications can be rejected",
      });
    }

    await application.update({
      status: "REJECTED",

      rejected_at: new Date(),

      rejected_by: req.user.id,

      rejection_reason,
    });

    return res.json({
      success: true,

      message:
        "Bus pass application rejected",

      application,
    });
  } catch (error) {
    console.error(
      "Reject application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject application",
    });
  }
};

const cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await BusPassApplication.findOne({
      where: {
        id,
        employee_id: req.user.employee_id,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      application.status !== "PENDING_APPROVAL" &&
      application.status !== "APPROVED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending or approved applications can be cancelled",
      });
    }

    await application.update({
      status: "CANCELLED",
      cancelled_at: new Date(),
    });

    return res.json({
      success: true,
      message: "Bus pass application cancelled successfully",
      application,
    });
  } catch (error) {
    console.error(
      "Cancel application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to cancel application",
    });
  }
};

// =====================================================
// Employee - Get own application/pass
// =====================================================

const getEmployeeApplications = async (
  req,
  res
) => {
  try {
    const employeeId =
      req.user.employee_id;

    if (!employeeId) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not linked to an employee record",
      });
    }

    const applications =
      await BusPassApplication.findAll({
        where: {
          employee_id: employeeId,
        },

        include: [
          {
            model: Employee,
            as: "employee",
            attributes: [
              "employee_code",
              "employee_name",
              "department",
              "designation",
            ],
          },

          {
            model: Bus,
            as: "bus",
          },

          {
            model: Route,
            as: "route",
          },

          {
            model: Shift,
            as: "shift",
          },

          {
            model: Stop,
            as: "pickupStop",
          },

          {
            model: Stop,
            as: "dropStop",
          },

          {
            model: BusPassBookingDate,
            as: "booking_dates",
            order: [
              ["booking_date", "ASC"],
            ],
          },
        ],

        order: [
          ["created_at", "DESC"],
        ],
      });

    return res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(
      "Get employee applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch employee applications",
    });
  }
};

// =====================================================
// Employee - Send approved pass QR to email
// =====================================================

const sendPassQRCodeEmail = async (
  req,
  res
) => {
  try {
    const { id } = req.params

    const employeeId = req.user.employee_id

    if (!employeeId) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not linked to an employee record",
      });
    }

    const application =
      await BusPassApplication.findOne({
        where: {
          id,
          employee_id: employeeId,
          status: "APPROVED",
        },

        include: [
          {
            model: Employee,
            as: "employee",
            attributes: [
              "employee_code",
              "employee_name",
              "department",
              "designation",
              "email",
              "mobile",
              "photograph",
            ],
          },

          {
            model: Bus,
            as: "bus",
          },

          {
            model: Route,
            as: "route",
          },

          {
            model: Shift,
            as: "shift",
          },

          {
            model: Stop,
            as: "pickupStop",
          },

          {
            model: Stop,
            as: "dropStop",
          },

          {
            model: BusPassBookingDate,
            as: "booking_dates",
            order: [
              ["booking_date", "ASC"],
            ],
          },
        ],
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Approved pass not found",
      });
    }

    const employee = application.employee

    if (!employee?.email) {
      return res.status(400).json({
        success: false,
        message:
          "No email address is linked to your employee profile. Please update your profile.",
      });
    }

    const bookingDates = application.booking_dates || []

    const sortedDates = [
      ...bookingDates,
    ]
      .map((item) => item.booking_date)
      .sort()

    const passValidFrom =
      sortedDates.length > 0
        ? sortedDates[0]
        : application.pass_valid_from

    const passValidTo =
      sortedDates.length > 0
        ? sortedDates[sortedDates.length - 1]
        : application.pass_valid_to

    const pass = {
      token: application.qr_token,
      passNumber: application.pass_number,
      employeeName: employee.employee_name,
      employeeCode: employee.employee_code,
      department: employee.department,
      routeNumber: application.route?.route_number,
      routeName: application.route?.route_name,
      busNumber: application.bus?.bus_number,
      shiftName: application.shift?.shift_name,
      pickupName: application.pickupStop?.stop_name,
      dropName: application.dropStop?.stop_name,
      validFrom: passValidFrom,
      validTo: passValidTo,
    }

    await sendQRCodeEmail({
      to: employee.email,
      pass,
    });

    return res.json({
      success: true,
      message: "QR code sent to your email successfully",
    });
  } catch (error) {
    console.error(
      "Send pass QR email error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send QR code email",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// Export
// =====================================================

const cancelBookingDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateIds } = req.body;

    if (!Array.isArray(dateIds) || !dateIds.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one date to cancel",
      });
    }

    const application = await BusPassApplication.findOne({
      where: {
        id,
        employee_id: req.user.employee_id,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      application.status !== "PENDING_APPROVAL" &&
      application.status !== "APPROVED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending or approved applications allow date cancellation",
      });
    }

    const bookingDates = await BusPassBookingDate.findAll({
      where: {
        id: { [Op.in]: dateIds },
        bus_pass_application_id: id,
        status: "BOOKED",
      },
    });

    if (!bookingDates.length) {
      return res.status(404).json({
        success: false,
        message: "No booked dates found to cancel",
      });
    }

    await BusPassBookingDate.update(
      { status: "CANCELLED" },
      {
        where: {
          id: { [Op.in]: dateIds },
          bus_pass_application_id: id,
        },
      }
    );

    const remainingActiveDates = await BusPassBookingDate.count({
      where: {
        bus_pass_application_id: id,
        status: "BOOKED",
      },
    });

    if (remainingActiveDates === 0) {
      await application.update({
        status: "CANCELLED",
        cancelled_at: new Date(),
      });
    }

    const updatedDates = await BusPassBookingDate.findAll({
      where: {
        bus_pass_application_id: id,
      },
      order: [["booking_date", "ASC"]],
    });

    return res.json({
      success: true,
      message: remainingActiveDates
        ? "Selected dates cancelled successfully"
        : "All dates cancelled, application fully cancelled",
      data: updatedDates,
    });
  } catch (error) {
    console.error("Cancel booking dates error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking dates",
    });
  }
};

module.exports = {
  createApplication,
  createAdminApplication,
  getPendingApplications,
  approveApplication,
  rejectApplication,
  cancelApplication,
  cancelBookingDates,
  getEmployeeApplications,
  sendPassQRCodeEmail,
};
