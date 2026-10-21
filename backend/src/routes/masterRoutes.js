const express = require("express");

const router = express.Router();

const {
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
} = require("../controllers/masterController");

const {
  authenticate,
  authorize,
} = require("../middleware/auth");

/*
|--------------------------------------------------------------------------
| Employee / authenticated APIs
|--------------------------------------------------------------------------
*/

router.get(
  "/routes",
  authenticate,
  getRoutes
);

router.get(
  "/shifts",
  authenticate,
  getShifts
);

router.get(
  "/stops",
  authenticate,
  getStops
);

router.get(
  "/available-buses",
  authenticate,
  getAvailableBuses
);

router.get(
  "/available-journeys",
  authenticate,
  getAvailableJourneys
);

router.get(
  "/route-stops",
  authenticate,
  getRouteStops
);

router.get(
  "/bus-routes/:id",
  authenticate,
  getBusRouteDetails
);

/*
|--------------------------------------------------------------------------
| Admin APIs
|--------------------------------------------------------------------------
*/

router.get(
  "/buses",
  authenticate,
  authorize("ADMIN"),
  getBuses
);

router.get(
  "/bus-routes",
  authenticate,
  authorize("ADMIN"),
  getBusRoutes
);
router.get("/sources", getSources);

router.get("/boarding-points", getBoardingPoints);

module.exports = router;
