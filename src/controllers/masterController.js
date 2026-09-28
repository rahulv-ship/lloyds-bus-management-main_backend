const {
  Bus,
  Route,
  Shift,
  Stop,
  BusRoute,
  BusRouteStop,
  BusPassApplication,
  BusPassBookingDate,
  Vendor,
  Driver,
  Conductor,
} = require("../models");

const { Op } = require("sequelize");

const BUS_CAPACITY = 52;

/**
 * ============================================================
 * SOURCE → EXCEL ROUTE NUMBER MAPPING
 * ============================================================
 *
 * This mapping is based on the actual Excel route sheet:
 *
 * Chandrapur → Route 1, 2, 3, 6, 8
 * Usgaon     → Route 4
 * Colony     → Route 5
 * Wani       → Route 7
 */
const SOURCE_ROUTE_NUMBERS = {
  Chandrapur: ["1", "2", "3", "6", "8"],
  Usgaon: ["4"],
  Colony: ["5"],
  Wani: ["7"],
};

const routeBelongsToSource = (route, source) => {
  const routes = SOURCE_ROUTE_NUMBERS[source];

  if (!routes || !route) {
    return false;
  }

  // The numbered Excel routes use the route-number mapping above. Operational
  // A/B/C services are stored as SHIFT-A, SHIFT-B and SHIFT-C, so they must be
  // matched using their configured route source instead.
  if (routes.includes(String(route.route_number))) {
    return true;
  }

  const routeSource = String(route.source || "")
    .trim()
    .toLowerCase();

  return routeSource === String(source).trim().toLowerCase();
};

/**
 * ============================================================
 * SOURCE DEFINITIONS
 * ============================================================
 */
const SOURCE_DEFINITIONS = [
  {
    key: "Chandrapur",
    label: "Chandrapur",
  },
  {
    key: "Colony",
    label: "Colony / Sakharwahi Fata",
  },
  {
    key: "Usgaon",
    label: "Usgao",
  },
  {
    key: "Wani",
    label: "Wani",
  },
];

const getSourceDefinition = (source) => {
  if (!source) {
    return null;
  }

  return SOURCE_DEFINITIONS.find(
    (item) =>
      item.key.toLowerCase() === String(source).toLowerCase() ||
      item.label.toLowerCase() === String(source).toLowerCase()
  );
};

/**
 * ============================================================
 * NORMALIZE BOOKING DATES
 * ============================================================
 */
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

/**
 * ============================================================
 * GET SOURCES
 * ============================================================
 */
const getSources = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SOURCE_DEFINITIONS.map((source) => ({
        key: source.key,
        label: source.label,
      })),
    });
  } catch (error) {
    console.error("getSources error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sources",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET ROUTES
 * ============================================================
 */
const getRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({
      where: {
        status: "ACTIVE",
      },
      order: [
        ["route_number", "ASC"],
      ],
    });

    return res.json({
      success: true,
      data: routes,
    });
  } catch (error) {
    console.error("getRoutes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET SHIFTS
 * ============================================================
 */
const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.findAll({
      where: {
        status: "ACTIVE",
      },
      order: [
        ["id", "ASC"],
      ],
    });

    return res.json({
      success: true,
      data: shifts,
    });
  } catch (error) {
    console.error("getShifts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shifts",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET BOARDING POINTS
 * ============================================================
 *
 * Flow:
 *
 * Source
 *   ↓
 * Boarding Point
 *   ↓
 * Destination = Plant
 *
 * Source filtering is based on Excel Route Number mapping.
 */
const getBoardingPoints = async (req, res) => {
  try {
    const { source, shift_id } = req.query;

    if (!source) {
      return res.status(400).json({
        success: false,
        message: "source is required",
      });
    }

    const sourceDefinition = getSourceDefinition(source);

    if (!sourceDefinition) {
      return res.status(400).json({
        success: false,
        message: "Invalid source",
      });
    }

    const busRouteWhere = {
      status: "ACTIVE",
    };

    if (shift_id) {
      busRouteWhere.shift_id = shift_id;
    }

    const busRoutes = await BusRoute.findAll({
      where: busRouteWhere,
      include: [
        {
          model: Route,
          as: "route",
          required: true,
          where: {
            status: "ACTIVE",
          },
        },
        {
          model: Shift,
          as: "shift",
          required: true,
          where: {
            status: "ACTIVE",
          },
        },
        {
          model: BusRouteStop,
          as: "stops",
          required: true,
          include: [
            {
              model: Stop,
              as: "stop",
              required: true,
              where: {
                status: "ACTIVE",
              },
            },
          ],
        },
      ],
      order: [
        ["id", "ASC"],
        [
          {
            model: BusRouteStop,
            as: "stops",
          },
          "stop_sequence",
          "ASC",
        ],
      ],
    });

    const result = new Map();

    for (const service of busRoutes) {
      /**
       * IMPORTANT:
       * Source is determined from Excel Route Number,
       * NOT from Route.source in database.
       */
      if (
        !routeBelongsToSource(service.route, sourceDefinition.key)
      ) {
        continue;
      }

      const routeStops = service.stops || [];

      /**
       * Find Plant stop
       */
      const plantStop = routeStops.find(
        (item) =>
          item.stop?.stop_name &&
          item.stop.stop_name.trim().toLowerCase() === "plant"
      );

      if (!plantStop) {
        continue;
      }

      for (const routeStop of routeStops) {
        const stop = routeStop.stop;

        if (!stop) {
          continue;
        }

        /**
         * Plant cannot be a boarding point
         */
        if (
          stop.stop_name &&
          stop.stop_name.trim().toLowerCase() === "plant"
        ) {
          continue;
        }

        /**
         * Boarding point must come before Plant
         */
        if (
          routeStop.stop_sequence >=
          plantStop.stop_sequence
        ) {
          continue;
        }

        /**
         * Pickup must be allowed
         */
        if (routeStop.pickup_allowed === false) {
          continue;
        }

        const stopId = String(stop.id);

        if (!result.has(stopId)) {
          result.set(stopId, {
            stop_id: stop.id,
            stop_code: stop.stop_code,
            stop_name: stop.stop_name,
            routes: [],
          });
        }

        const existing = result.get(stopId);

        const routeInfo = {
          route_id: service.route_id,
          route_number: service.route.route_number,
          route_name: service.route.route_name,
          bus_route_id: service.id,
          shift_id: service.shift_id,
          shift_code: service.shift?.shift_code,
          shift_name: service.shift?.shift_name,
          arrival_time: routeStop.arrival_time,
          departure_time: routeStop.departure_time,
        };

        const alreadyExists = existing.routes.some(
          (route) =>
            route.route_id === routeInfo.route_id &&
            route.shift_id === routeInfo.shift_id
        );

        if (!alreadyExists) {
          existing.routes.push(routeInfo);
        }
      }
    }

    const data = Array.from(result.values()).sort((a, b) =>
      a.stop_name.localeCompare(b.stop_name)
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getBoardingPoints error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch boarding points",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET STOPS
 * ============================================================
 */
const getStops = async (req, res) => {
  try {
    const stops = await Stop.findAll({
      where: {
        status: "ACTIVE",
      },
      order: [
        ["stop_name", "ASC"],
      ],
    });

    return res.json({
      success: true,
      data: stops,
    });
  } catch (error) {
    console.error("getStops error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stops",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET AVAILABLE BUSES
 * ============================================================
 *
 * Filters:
 *
 * Source
 * Boarding Point
 * Shift
 * Booking Dates
 *
 * Capacity is checked:
 *
 * Physical Bus + Shift + Date
 *
 * Every bus has capacity = 52.
 */
const getAvailableBuses = async (req, res) => {
  try {
    const {
      source,
      pickup_stop_id,
      shift_id,
      booking_dates,
    } = req.query;

    console.log("========================================");
    console.log("GET AVAILABLE BUSES");
    console.log({
      source,
      pickup_stop_id,
      shift_id,
      booking_dates,
    });

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!source) {
      return res.status(400).json({
        success: false,
        message: "source is required",
      });
    }

    if (!pickup_stop_id) {
      return res.status(400).json({
        success: false,
        message: "pickup_stop_id is required",
      });
    }

    if (!shift_id) {
      return res.status(400).json({
        success: false,
        message: "shift_id is required",
      });
    }

    const sourceDefinition = getSourceDefinition(source);

    if (!sourceDefinition) {
      return res.status(400).json({
        success: false,
        message: "Invalid source",
      });
    }

    // ---------------------------------------------------------
    // NORMALIZE BOOKING DATES
    // ---------------------------------------------------------

    let dates = [];

    if (Array.isArray(booking_dates)) {
      dates = normalizeBookingDates(booking_dates);
    } else if (typeof booking_dates === "string") {
      dates = normalizeBookingDates(
        booking_dates.split(",")
      );
    }

    console.log("Normalized dates:", dates);

    // ---------------------------------------------------------
    // FETCH ACTIVE BUS ROUTES FOR SELECTED SHIFT
    // ---------------------------------------------------------

    const busRoutes = await BusRoute.findAll({
      where: {
        status: "ACTIVE",
        shift_id: shift_id,
      },

      include: [
        {
          model: Bus,
          as: "bus",
          required: true,
          where: {
            status: "ACTIVE",
          },
        },

        {
          model: Route,
          as: "route",
          required: true,
          where: {
            status: "ACTIVE",
          },
        },

        {
          model: Shift,
          as: "shift",
          required: true,
          where: {
            status: "ACTIVE",
          },
        },

        {
          model: BusRouteStop,
          as: "stops",
          required: true,

          include: [
            {
              model: Stop,
              as: "stop",
              required: true,
              where: {
                status: "ACTIVE",
              },
            },
          ],
        },
      ],

      order: [
        ["id", "ASC"],
      ],
    });

    console.log(
      "Bus routes found:",
      busRoutes.length
    );

    // ---------------------------------------------------------
    // BUILD AVAILABLE BUS RESULT
    // ---------------------------------------------------------

    const result = [];

    for (const service of busRoutes) {
      console.log("----------------------------------------");

      console.log("Checking BusRoute:", service.id);

      // -------------------------------------------------------
      // SOURCE → ROUTE NUMBER MAPPING
      // -------------------------------------------------------

      const routeNumber =
        service.route?.route_number;

      console.log(
        "Route:",
        routeNumber,
        "Source:",
        sourceDefinition.key
      );

      if (
        !routeBelongsToSource(service.route, sourceDefinition.key)
      ) {
        console.log(
          "SKIPPED: Route does not belong to source"
        );

        continue;
      }

      // -------------------------------------------------------
      // GET ROUTE STOPS
      // -------------------------------------------------------

      const routeStops = service.stops || [];

      console.log(
        "Route stops:",
        routeStops.length
      );

      // -------------------------------------------------------
      // FIND PICKUP STOP
      // -------------------------------------------------------

      const pickupStop = routeStops.find(
        (item) =>
          String(item.stop_id) ===
          String(pickup_stop_id)
      );

      if (!pickupStop) {
        console.log(
          "SKIPPED: Pickup stop not found"
        );

        continue;
      }

      console.log(
        "Pickup:",
        pickupStop.stop?.stop_name,
        "Sequence:",
        pickupStop.stop_sequence
      );

      // -------------------------------------------------------
      // CHECK PICKUP ALLOWED
      // -------------------------------------------------------

      if (
        pickupStop.pickup_allowed === false ||
        pickupStop.pickup_allowed === 0 ||
        pickupStop.pickup_allowed === "0"
      ) {
        console.log(
          "SKIPPED: Pickup not allowed"
        );

        continue;
      }

      // -------------------------------------------------------
      // FIND PLANT
      // -------------------------------------------------------

      const plantStop = routeStops.find(
        (item) => {
          const name =
            item.stop?.stop_name
              ?.trim()
              .toLowerCase();

          return name === "plant";
        }
      );

      if (!plantStop) {
        console.log(
          "SKIPPED: Plant stop not found"
        );

        continue;
      }

      console.log(
        "Plant:",
        plantStop.stop?.stop_name,
        "Sequence:",
        plantStop.stop_sequence
      );

      // -------------------------------------------------------
      // PICKUP MUST BE BEFORE PLANT
      // -------------------------------------------------------

      if (
        Number(pickupStop.stop_sequence) >=
        Number(plantStop.stop_sequence)
      ) {
        console.log(
          "SKIPPED: Pickup is after Plant"
        );

        continue;
      }

      // -------------------------------------------------------
      // BUS CAPACITY
      // -------------------------------------------------------

      const capacity =
        Number(service.bus?.seating_capacity) ||
        BUS_CAPACITY;

      // Requirement:
      // Every bus = 52 seats
      const busCapacity = BUS_CAPACITY;

      // -------------------------------------------------------
      // DATE-WISE CAPACITY
      // -------------------------------------------------------

      const dateWiseCapacity = [];

      let minimumRemaining = busCapacity;

      for (const date of dates) {
        const bookedCount =
          await BusPassBookingDate.count({
            where: {
              booking_date: date,
              status: "BOOKED",
            },

            include: [
              {
                model: BusPassApplication,
                as: "application",
                required: true,
                attributes: [],
                where: {
                  bus_id: service.bus_id,
                  shift_id: service.shift_id,

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

        const remaining = Math.max(
          busCapacity - bookedCount,
          0
        );

        minimumRemaining = Math.min(
          minimumRemaining,
          remaining
        );

        dateWiseCapacity.push({
          date,
          booked: bookedCount,
          capacity: busCapacity,
          remaining,
          available: remaining > 0,
        });
      }

      // -------------------------------------------------------
      // BUS AVAILABLE FOR ALL SELECTED DATES?
      // -------------------------------------------------------

      const availableForAllDates =
        dates.length === 0 ||
        dateWiseCapacity.every(
          (item) => item.available
        );

      console.log({
        bus: service.bus?.bus_number,
        capacity: busCapacity,
        dates,
        dateWiseCapacity,
        availableForAllDates,
      });

      // -------------------------------------------------------
      // ADD BUS TO RESULT
      // -------------------------------------------------------

      result.push({
        bus_route_id: service.id,

        bus_id: service.bus_id,

        bus_number:
          service.bus?.bus_number || null,

        bus_type:
          service.bus?.bus_type || null,

        // Requirement: every bus = 52
        capacity: busCapacity,

        seating_capacity: busCapacity,

        route_id: service.route_id,

        route_number:
          service.route?.route_number || null,

        route_name:
          service.route?.route_name || null,

        shift_id:
          service.shift_id,

        shift_code:
          service.shift?.shift_code || null,

        shift_name:
          service.shift?.shift_name || null,

        pickup_stop_id:
          pickupStop.stop_id,

        pickup_stop_name:
          pickupStop.stop?.stop_name || null,

        pickup_sequence:
          pickupStop.stop_sequence,

        onboarding_time:
          pickupStop.arrival_time ||
          pickupStop.departure_time ||
          null,

        drop_stop_id:
          plantStop.stop_id,

        drop_stop_name:
          plantStop.stop?.stop_name || "Plant",

        drop_sequence:
          plantStop.stop_sequence,

        available:
          availableForAllDates,

        remaining_capacity:
          dates.length > 0
            ? minimumRemaining
            : busCapacity,

        date_wise_capacity:
          dateWiseCapacity,
      });
    }

    console.log(
      "FINAL AVAILABLE BUSES:",
      result.length
    );

    console.log("========================================");

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "getAvailableBuses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available buses",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET AVAILABLE JOURNEYS
 * ============================================================
 */
const getAvailableJourneys = async (req, res) => {
  try {
    const {
      source,
      shift_id,
      pickup_stop_id,
      booking_dates,
    } = req.query;

    const params = new URLSearchParams();

    if (source) {
      params.append("source", source);
    }

    if (shift_id) {
      params.append("shift_id", shift_id);
    }

    if (pickup_stop_id) {
      params.append(
        "pickup_stop_id",
        pickup_stop_id
      );
    }

    if (booking_dates) {
      params.append(
        "booking_dates",
        booking_dates
      );
    }

    /**
     * Reuse getAvailableBuses logic internally
     */
    req.query = {
      source,
      shift_id,
      pickup_stop_id,
      booking_dates,
    };

    return getAvailableBuses(req, res);
  } catch (error) {
    console.error(
      "getAvailableJourneys error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available journeys",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET ROUTE STOPS
 * ============================================================
 */
const getRouteStops = async (req, res) => {
  try {
    const { route_id, shift_id } = req.query;

    if (!route_id) {
      return res.status(400).json({
        success: false,
        message: "route_id is required",
      });
    }

    const where = {
      route_id,
    };

    if (shift_id) {
      where.shift_id = shift_id;
    }

    const routeStops = await BusRouteStop.findAll({
      include: [
        {
          model: BusRoute,
          as: "bus_route",
          required: true,
          where: {
            route_id,
            ...(shift_id ? { shift_id } : {}),
            status: "ACTIVE",
          },
          include: [
            {
              model: Route,
              as: "route",
              required: true,
            },
            {
              model: Shift,
              as: "shift",
              required: true,
            },
          ],
        },
        {
          model: Stop,
          as: "stop",
          required: true,
        },
      ],
      order: [
        ["stop_sequence", "ASC"],
      ],
    });

    return res.json({
      success: true,
      data: routeStops,
    });
  } catch (error) {
    console.error("getRouteStops error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch route stops",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET BUS ROUTE DETAILS
 * ============================================================
 */
const getBusRouteDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bus route ID is required",
      });
    }

    const busRoute = await BusRoute.findByPk(id, {
      include: [
        {
          model: Bus,
          as: "bus",
          required: true,
        },
        {
          model: Route,
          as: "route",
          required: true,
        },
        {
          model: Shift,
          as: "shift",
          required: true,
        },
        {
          model: BusRouteStop,
          as: "stops",
          required: false,
          include: [
            {
              model: Stop,
              as: "stop",
              required: true,
            },
          ],
        },
      ],
    });

    if (!busRoute) {
      return res.status(404).json({
        success: false,
        message: "Bus route not found",
      });
    }

    return res.json({
      success: true,
      data: busRoute,
    });
  } catch (error) {
    console.error(
      "getBusRouteDetails error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bus route details",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET ALL BUSES - ADMIN
 * ============================================================
 */
const getBuses = async (req, res) => {
  try {
    const buses = await Bus.findAll({
      order: [
        ["bus_number", "ASC"],
      ],
    });

    return res.json({
      success: true,
      data: buses,
    });
  } catch (error) {
    console.error("getBuses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch buses",
      error: error.message,
    });
  }
};

/**
 * ============================================================
 * GET ALL BUS ROUTES - ADMIN
 * ============================================================
 */
const getBusRoutes = async (req, res) => {
  try {
    const busRoutes = await BusRoute.findAll({
      include: [
        {
          model: Bus,
          as: "bus",
          required: false,
        },
        {
          model: Route,
          as: "route",
          required: false,
        },
        {
          model: Shift,
          as: "shift",
          required: false,
        },
      ],
      order: [
        ["id", "ASC"],
      ],
    });

    return res.json({
      success: true,
      data: busRoutes,
    });
  } catch (error) {
    console.error("getBusRoutes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bus routes",
      error: error.message,
    });
  }
};

module.exports = {
  getSources,
  getRoutes,
  getShifts,
  getBoardingPoints,
  getStops,
  getAvailableBuses,
  getAvailableJourneys,
  getRouteStops,
  getBusRouteDetails,
  getBuses,
  getBusRoutes,
};
