const User = require("./User");
const Employee = require("./Employee");
const Vendor = require("./Vendor");
const Driver = require("./Driver");
const Conductor = require("./Conductor");
const Bus = require("./Bus");
const Route = require("./Route");
const Stop = require("./Stop");
const Shift = require("./Shift");
const RouteStop = require("./RouteStop");
const BusRoute = require("./BusRoute");
const BusPassApplication = require("./BusPassApplication");
const BusRouteStop = require("./BusRouteStop");
const BusPassBookingDate = require("./BusPassBookingDate");
const Notification = require("./Notification");
const Alert = require("./Alert");

// =========================
// Employee <-> User
// =========================

Employee.hasOne(User, {
  foreignKey: "employee_id",
  as: "user",
});

User.belongsTo(Employee, {
  foreignKey: "employee_id",
  as: "employee",
});

// =========================
// Vendor <-> Driver
// =========================

Vendor.hasMany(Driver, {
  foreignKey: "vendor_id",
  as: "drivers",
});

Driver.belongsTo(Vendor, {
  foreignKey: "vendor_id",
  as: "vendor",
});

// =========================
// Vendor <-> Conductor
// =========================

Vendor.hasMany(Conductor, {
  foreignKey: "vendor_id",
  as: "conductors",
});

Conductor.belongsTo(Vendor, {
  foreignKey: "vendor_id",
  as: "vendor",
});

// =========================
// Vendor <-> Bus
// =========================

Vendor.hasMany(Bus, {
  foreignKey: "vendor_id",
  as: "buses",
});

Bus.belongsTo(Vendor, {
  foreignKey: "vendor_id",
  as: "vendor",
});

// =========================
// Driver <-> Bus
// =========================

Driver.hasMany(Bus, {
  foreignKey: "driver_id",
  as: "buses",
});

Bus.belongsTo(Driver, {
  foreignKey: "driver_id",
  as: "driver",
});

// =========================
// Conductor <-> Bus
// =========================

Conductor.hasMany(Bus, {
  foreignKey: "conductor_id",
  as: "buses",
});

Bus.belongsTo(Conductor, {
  foreignKey: "conductor_id",
  as: "conductor",
});

// =========================
// Route <-> RouteStop
// =========================

Route.hasMany(RouteStop, {
  foreignKey: "route_id",
  as: "routeStops",
});

RouteStop.belongsTo(Route, {
  foreignKey: "route_id",
  as: "route",
});

// =========================
// Stop <-> RouteStop
// =========================

Stop.hasMany(RouteStop, {
  foreignKey: "stop_id",
  as: "routeStops",
});

RouteStop.belongsTo(Stop, {
  foreignKey: "stop_id",
  as: "stop",
});

// =========================
// Bus <-> BusRoute
// =========================

Bus.hasMany(BusRoute, {
  foreignKey: "bus_id",
  as: "busRoutes",
});

BusRoute.belongsTo(Bus, {
  foreignKey: "bus_id",
  as: "bus",
});

// =========================
// Route <-> BusRoute
// =========================

Route.hasMany(BusRoute, {
  foreignKey: "route_id",
  as: "busRoutes",
});

BusRoute.belongsTo(Route, {
  foreignKey: "route_id",
  as: "route",
});

// =========================
// Shift <-> BusRoute
// =========================

Shift.hasMany(BusRoute, {
  foreignKey: "shift_id",
  as: "busRoutes",
});

BusRoute.belongsTo(Shift, {
  foreignKey: "shift_id",
  as: "shift",
});
// =========================
// Employee <-> Bus Pass Application
// =========================

Employee.hasMany(BusPassApplication, {
  foreignKey: "employee_id",
  sourceKey: "employee_code",
  as: "busPassApplications",
});

BusPassApplication.belongsTo(Employee, {
  foreignKey: "employee_id",
  targetKey: "employee_code",
  as: "employee",
});

// =========================
// Bus <-> Bus Pass Application
// =========================

Bus.hasMany(BusPassApplication, {
  foreignKey: "bus_id",
  as: "busPassApplications",
});

BusPassApplication.belongsTo(Bus, {
  foreignKey: "bus_id",
  as: "bus",
});

// =========================
// Route <-> Bus Pass Application
// =========================

Route.hasMany(BusPassApplication, {
  foreignKey: "route_id",
  as: "busPassApplications",
});

BusPassApplication.belongsTo(Route, {
  foreignKey: "route_id",
  as: "route",
});

// =========================
// Shift <-> Bus Pass Application
// =========================

Shift.hasMany(BusPassApplication, {
  foreignKey: "shift_id",
  as: "busPassApplications",
});

BusPassApplication.belongsTo(Shift, {
  foreignKey: "shift_id",
  as: "shift",
});

// =========================
// Pickup Stop
// =========================

Stop.hasMany(BusPassApplication, {
  foreignKey: "pickup_stop_id",
  as: "pickupApplications",
});

BusPassApplication.belongsTo(Stop, {
  foreignKey: "pickup_stop_id",
  as: "pickupStop",
});


// =========================
// Drop Stop
// =========================

Stop.hasMany(BusPassApplication, {
  foreignKey: "drop_stop_id",
  as: "dropApplications",
});

BusPassApplication.belongsTo(Stop, {
  foreignKey: "drop_stop_id",
  as: "dropStop",
});
// BusRoute <-> BusRouteStop
BusRoute.hasMany(BusRouteStop, {
  foreignKey: "bus_route_id",
  as: "stops",
});

BusRouteStop.belongsTo(BusRoute, {
  foreignKey: "bus_route_id",
  as: "busRoute",
});

// Stop <-> BusRouteStop
Stop.hasMany(BusRouteStop, {
  foreignKey: "stop_id",
  as: "busRouteStops",
});

BusRouteStop.belongsTo(Stop, {
  foreignKey: "stop_id",
  as: "stop",
});
BusPassApplication.hasMany(BusPassBookingDate, {
  foreignKey: "bus_pass_application_id",
  as: "booking_dates",
});

BusPassBookingDate.belongsTo(BusPassApplication, {
  foreignKey: "bus_pass_application_id",
  as: "application",
});

Notification.belongsTo(Employee, {
  foreignKey: "employee_code",
  targetKey: "employee_code",
  as: "employee",
});

module.exports = {
  User,
  Employee,
  Vendor,
  Driver,
  Conductor,
  Bus,
  Route,
  Stop,
  Shift,
  RouteStop,
  BusRoute,
  BusRouteStop,
  BusPassApplication,
  BusPassBookingDate,
  Notification,
  Alert,
};
