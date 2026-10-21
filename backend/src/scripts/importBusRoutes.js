const XLSX = require("xlsx");
const path = require("path");
const { sequelize } = require("../config/database");

const {
  Bus,
  Route,
  Stop,
  Shift,
  BusRoute,
  BusRouteStop,
} = require("../models");

// An optional file path can be supplied when the source workbook is moved:
// npm run import:routes -- "C:\\path\\to\\Bus Route.xlsx"
const FILE_PATH = process.argv[2] || path.join(
  "C:",
  "Users",
  "Aditya Baghel",
  "Downloads",
  "Bus Route (1).xlsx"
);

const workbook = XLSX.readFile(FILE_PATH, {
  cellDates: true,
});

const sheet = workbook.Sheets["Sheet1"];

if (!sheet) {
  throw new Error("Sheet1 not found");
}

const rows = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  defval: null,
  raw: true,
});

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function text(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const result = String(value)
    .replace(/\s+/g, " ")
    .trim();

  return result || null;
}

function normalizeStop(value) {
  return text(value)
    ?.toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBusNumber(value) {
  if (!value) return null;

  return String(value)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
}

function timeToString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  /*
   * Excel Date object
   */
  if (value instanceof Date) {
    return [
      String(value.getHours()).padStart(2, "0"),
      String(value.getMinutes()).padStart(2, "0"),
      String(value.getSeconds()).padStart(2, "0"),
    ].join(":");
  }

  /*
   * Excel numeric time
   *
   * Example:
   * 0.5 = 12:00
   */
  if (
    typeof value === "number" &&
    value >= 0 &&
    value < 1
  ) {
    const totalSeconds = Math.round(
      value * 24 * 60 * 60
    );

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }

  /*
   * Values like:
   *
   * 858
   *
   * should become:
   *
   * 08:58
   */
  const valueText = text(value);

  if (/^\d{3,4}$/.test(valueText)) {
    const digits = valueText.padStart(4, "0");

    const hours = Number(
      digits.substring(0, digits.length - 2)
    );

    const minutes = Number(
      digits.substring(digits.length - 2)
    );

    if (
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {
      return `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(2, "0")}:00`;
    }
  }

  /*
   * HH:MM
   */
  if (/^\d{1,2}:\d{2}$/.test(valueText)) {
    const [hour, minute] = valueText.split(":");

    return `${String(hour).padStart(
      2,
      "0"
    )}:${minute}:00`;
  }

  return valueText;
}

/*
|--------------------------------------------------------------------------
| Caches
|--------------------------------------------------------------------------
*/

const busCache = new Map();
const routeCache = new Map();
const stopCache = new Map();
const shiftCache = new Map();
const busRouteCache = new Map();

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

const stats = {
  busesCreated: 0,
  routesCreated: 0,
  stopsCreated: 0,
  shiftsCreated: 0,
  busRoutesCreated: 0,
  timingsCreated: 0,
};

const warnings = [];

/*
|--------------------------------------------------------------------------
| BUS
|--------------------------------------------------------------------------
*/

async function getOrCreateBus(busNumber) {
  const normalized = normalizeBusNumber(busNumber);

  if (!normalized) {
    return null;
  }

  if (busCache.has(normalized)) {
    return busCache.get(normalized);
  }

  let bus = await Bus.findOne({
    where: {
      bus_number: normalized,
    },
  });

  if (!bus) {
    bus = await Bus.create({
      bus_number: normalized,
      bus_type: "Route service",
      seating_capacity: null,
      status: "ACTIVE",
    });

    stats.busesCreated++;
  }

  busCache.set(normalized, bus);

  return bus;
}

/*
|--------------------------------------------------------------------------
| ROUTE
|--------------------------------------------------------------------------
*/

async function getOrCreateRoute(
  routeNumber,
  routeName,
  source,
  destination
) {
  if (routeCache.has(routeNumber)) {
    return routeCache.get(routeNumber);
  }

  let route = await Route.findOne({
    where: {
      route_number: routeNumber,
    },
  });

  if (!route) {
    route = await Route.create({
      route_number: routeNumber,
      route_name: routeName,
      source,
      destination,
      status: "ACTIVE",
    });

    stats.routesCreated++;
  }

  routeCache.set(routeNumber, route);

  return route;
}

/*
|--------------------------------------------------------------------------
| STOP
|--------------------------------------------------------------------------
*/

async function getOrCreateStop(stopName) {
  const normalized = normalizeStop(stopName);

  if (!normalized) {
    return null;
  }

  if (stopCache.has(normalized)) {
    return stopCache.get(normalized);
  }

  let stop = await Stop.findOne({
    where: {
      stop_name: text(stopName),
    },
  });

  /*
   * If exact name doesn't exist, search by normalized name.
   */
  if (!stop) {
    const allStops = await Stop.findAll();

    stop = allStops.find(
      (item) =>
        normalizeStop(item.stop_name) === normalized
    );
  }

  if (!stop) {
    const codeBase = normalized
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 35);

    let stopCode = `STOP-${codeBase}`;

    let counter = 1;

    while (
      await Stop.findOne({
        where: {
          stop_code: stopCode,
        },
      })
    ) {
      stopCode = `STOP-${codeBase}-${counter}`;
      counter++;
    }

    stop = await Stop.create({
      stop_code: stopCode,
      stop_name: text(stopName),
      status: "ACTIVE",
    });

    stats.stopsCreated++;
  }

  stopCache.set(normalized, stop);

  return stop;
}

/*
|--------------------------------------------------------------------------
| SHIFT
|--------------------------------------------------------------------------
*/

async function getOrCreateShift(
  code,
  name,
  startTime,
  endTime
) {
  if (shiftCache.has(code)) {
    return shiftCache.get(code);
  }

  let shift = await Shift.findOne({
    where: {
      shift_code: code,
    },
  });

  if (!shift) {
    shift = await Shift.create({
      shift_code: code,
      shift_name: name,
      start_time: startTime,
      end_time: endTime,
      status: "ACTIVE",
    });

    stats.shiftsCreated++;
  }

  shiftCache.set(code, shift);

  return shift;
}

/*
|--------------------------------------------------------------------------
| BUS ROUTE
|--------------------------------------------------------------------------
*/

async function getOrCreateBusRoute(
  bus,
  route,
  shift
) {
  if (!bus) {
    return null;
  }

  const key = `${bus.id}-${route.id}-${shift.id}`;

  if (busRouteCache.has(key)) {
    return busRouteCache.get(key);
  }

  let busRoute = await BusRoute.findOne({
    where: {
      bus_id: bus.id,
      route_id: route.id,
      shift_id: shift.id,
    },
  });

  if (!busRoute) {
    busRoute = await BusRoute.create({
      bus_id: bus.id,
      route_id: route.id,
      shift_id: shift.id,
      employee_capacity: null,
      contracted_km: null,
      status: "ACTIVE",
    });

    stats.busRoutesCreated++;
  }

  busRouteCache.set(key, busRoute);

  return busRoute;
}

/*
|--------------------------------------------------------------------------
| ROUTE BLOCK
|--------------------------------------------------------------------------
*/

async function importRoute({
  routeNumber,
  routeName,
  busNumbers,
  startColumn,
  startRow = 2,
  endRow,
  shift,
}) {
  console.log("");
  console.log(
    `Importing Route ${routeNumber}...`
  );

  const route = await getOrCreateRoute(
    routeNumber,
    routeName,
    "Chandrapur",
    "Plant"
  );

  for (const busNumber of busNumbers) {
    const bus = await getOrCreateBus(busNumber);

    const busRoute = await getOrCreateBusRoute(
      bus,
      route,
      shift
    );

    let sequence = 1;

    for (
      let rowIndex = startRow;
      rowIndex <= endRow;
      rowIndex++
    ) {
      const row = rows[rowIndex];

      const srNo = row[startColumn];

      const stopName = row[startColumn + 1];

      const time = row[startColumn + 2];

      // Ignore blank lines and embedded column headers (for example Route 5).
      if (!Number.isFinite(Number(srNo)) || !stopName) {
        continue;
      }

      /*
       * Stop when next route starts.
       */
      if (
        String(stopName)
          .toUpperCase()
          .startsWith("ROUTE-")
      ) {
        break;
      }

      const stop = await getOrCreateStop(stopName);

      if (!stop || !busRoute) {
        continue;
      }

      const arrivalTime = timeToString(time);

      const [record, created] =
        await BusRouteStop.findOrCreate({
          where: {
            bus_route_id: busRoute.id,
            stop_id: stop.id,
          },

          defaults: {
            stop_sequence: sequence,
            arrival_time: arrivalTime,
            departure_time: arrivalTime,
            pickup_allowed: true,
            drop_allowed: true,
          },
        });

      if (created) {
        stats.timingsCreated++;
      }

      sequence++;
    }
  }
}

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

async function main() {
  console.log("");
  console.log(
    "================================================"
  );
  console.log(
    "🚍 LLOYDS BUS MASTER DATA IMPORT"
  );
  console.log(
    "================================================"
  );

  console.log(`Excel: ${FILE_PATH}`);

  // Ensures the bus_route_stops table exists before importing route timings.
  await sequelize.sync();

  /*
   * Shifts from actual Excel.
   *
   * We keep A/B/C as separate operational
   * schedules.
   */

  const shiftA = await getOrCreateShift(
    "A",
    "A Shift",
    "04:55:00",
    "05:55:00"
  );

  const shiftB = await getOrCreateShift(
    "B",
    "B Shift",
    "12:50:00",
    "13:55:00"
  );

  const shiftC = await getOrCreateShift(
    "C",
    "C Shift",
    "20:50:00",
    "21:55:00"
  );

  // General office shift. Its route timetable is managed separately from the
  // A/B/C schedules in this workbook.
  const shiftG = await getOrCreateShift(
    "G",
    "General Shift",
    "09:00:00",
    "18:00:00"
  );

  /*
   * Route 1
   * Columns A:C
   * Rows 3:18
   */

  await importRoute({
    routeNumber: "1",
    routeName: "Chandrapur",
    busNumbers: ["BUS-01"],
    startColumn: 0,
    endRow: 18,
    shift: shiftG,
  });

  /*
   * Route 2
   * Columns E:G
   * Bus 02 & 03
   */

  await importRoute({
    routeNumber: "2",
    routeName: "Chandrapur",
    busNumbers: ["BUS-02", "BUS-03"],
    startColumn: 4,
    endRow: 17,
    shift: shiftG,
  });

  /*
   * Route 3
   * Columns I:K
   * Bus 04
   */

  await importRoute({
    routeNumber: "3",
    routeName: "Chandrapur",
    busNumbers: ["BUS-04"],
    startColumn: 8,
    endRow: 22,
    shift: shiftG,
  });

  /*
   * Route 4
   * Columns M:O
   * Bus 05
   * Rows 3:6
   */

  await importRoute({
    routeNumber: "4",
    routeName: "Usagaon",
    busNumbers: ["BUS-05"],
    startColumn: 12,
    endRow: 6,
    shift: shiftG,
  });

  /*
   * Route 5
   * Columns M:O
   * Bus 06
   * Rows 11:14
   */

  await importRoute({
    routeNumber: "5",
    routeName: "Colony / Sakharwahi Fata",
    busNumbers: ["BUS-06"],
    startColumn: 12,
    startRow: 10,
    endRow: 14,
    shift: shiftG,
  });

  /*
   * Route 6
   * Columns Q:S
   *
   * The workbook does not label Route 6's physical bus. Create a dedicated
   * internal service record so the route is bookable; employee APIs do not
   * expose this identifier or any bus number.
   */

  await importRoute({
    routeNumber: "6",
    routeName: "Chandrapur",
    busNumbers: ["ROUTE-06-SERVICE"],
    startColumn: 16,
    endRow: 13,
    shift: shiftG,
  });

  /*
   * Route 7
   * Columns U:W
   * Source says Bus 07
   */

  await importRoute({
    routeNumber: "7",
    routeName: "Wani",
    busNumbers: ["BUS-07"],
    startColumn: 20,
    endRow: 13,
    shift: shiftG,
  });

  /*
   * Route 8
   * Columns Y:AA
   *
   * Source also says Bus 07.
   *
   * We preserve the source value but flag it.
   */

  warnings.push(
    "Route 8: Source Excel specifies BUS-07. This has been preserved exactly and should be verified if Route 8 uses a different physical bus."
  );

  await importRoute({
    routeNumber: "8",
    routeName: "Chandrapur",
    busNumbers: ["BUS-07"],
    startColumn: 24,
    endRow: 12,
    shift: shiftG,
  });

  /*
   * Shift A/B/C operational schedules
   *
   * Source Excel says Bus 01 & 07.
   *
   * These are stored as separate shift schedules.
   */

  const shiftSchedules = [
    {
      shift: shiftA,
      column: 0,
    },
    {
      shift: shiftB,
      column: 4,
    },
    {
      shift: shiftC,
      column: 8,
    },
  ];

  for (const schedule of shiftSchedules) {
    const {
      shift,
      column,
    } = schedule;

    /*
     * Create a separate operational route for
     * Chandrapur → Plant shift service.
     */

    const route = await getOrCreateRoute(
      `SHIFT-${shift.shift_code}`,
      `${shift.shift_name} Chandrapur To Plant`,
      "Chandrapur",
      "Plant"
    );

    /*
     * Source explicitly says Bus 01 & 07.
     */

    for (const busNumber of [
      "BUS-01",
      "BUS-07",
    ]) {
      const bus = await getOrCreateBus(
        busNumber
      );

      const busRoute =
        await getOrCreateBusRoute(
          bus,
          route,
          shift
        );

      for (
        let rowIndex = 25;
        rowIndex <= 43;
        rowIndex++
      ) {
        const row = rows[rowIndex];

        const srNo = row[column];

        const stopName =
          row[column + 1];

        const time =
          row[column + 2];

        if (!srNo || !stopName) {
          continue;
        }

        const stop =
          await getOrCreateStop(
            stopName
          );

        const arrivalTime =
          timeToString(time);

        await BusRouteStop.findOrCreate({
          where: {
            bus_route_id: busRoute.id,
            stop_id: stop.id,
          },

          defaults: {
            stop_sequence: Number(srNo),
            arrival_time: arrivalTime,
            departure_time: arrivalTime,
            pickup_allowed: true,
            drop_allowed: true,
          },
        });
      }
    }
  }

  /*
   * FINAL REPORT
   */

  console.log("");
  console.log(
    "================================================"
  );
  console.log("✅ IMPORT COMPLETED");
  console.log(
    "================================================"
  );

  console.log(
    `Buses created       : ${stats.busesCreated}`
  );

  console.log(
    `Routes created      : ${stats.routesCreated}`
  );

  console.log(
    `Stops created       : ${stats.stopsCreated}`
  );

  console.log(
    `Shifts created      : ${stats.shiftsCreated}`
  );

  console.log(
    `Bus-Route mappings  : ${stats.busRoutesCreated}`
  );

  console.log(
    `Stop timings        : ${stats.timingsCreated}`
  );

  if (warnings.length) {
    console.log("");
    console.log(
      "⚠️ SOURCE DATA WARNINGS"
    );
    console.log(
      "------------------------------------------------"
    );

    warnings.forEach((warning) => {
      console.log(`- ${warning}`);
    });
  }

  console.log("");
  console.log(
    "================================================"
  );
}

main()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("");
    console.error(
      "❌ IMPORT FAILED"
    );
    console.error(error);

    await sequelize.close();
    process.exit(1);
  });
