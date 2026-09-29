const { sequelize } = require('../config/database');
const {
  Bus,
  Route,
  Shift,
  BusRoute,
  BusRouteStop,
  Stop,
} = require('../models');

async function ensureShift(code, name, startTime, endTime) {
  let shift = await Shift.findOne({ where: { shift_code: code } });
  if (!shift) {
    shift = await Shift.create({
      shift_code: code,
      shift_name: name,
      start_time: startTime,
      end_time: endTime,
      status: 'ACTIVE',
    });
    console.log(`Created shift ${code}`);
  } else {
    await shift.update({
      shift_name: name,
      start_time: startTime,
      end_time: endTime,
      status: 'ACTIVE',
    });
    console.log(`Updated shift ${code}`);
  }
  return shift;
}

async function ensureRoute(routeNumber, routeName, source, destination) {
  let route = await Route.findOne({ where: { route_number: routeNumber } });
  if (!route) {
    route = await Route.create({
      route_number: routeNumber,
      route_name: routeName,
      source,
      destination,
      status: 'ACTIVE',
    });
    console.log(`Created route ${routeNumber}`);
  } else {
    await route.update({
      route_name: routeName,
      source,
      destination,
      status: 'ACTIVE',
    });
    console.log(`Updated route ${routeNumber}`);
  }
  return route;
}

async function ensureBus(busNumber) {
  const normalized = String(busNumber).trim().toUpperCase().replace(/\s+/g, '-');
  let bus = await Bus.findOne({ where: { bus_number: normalized } });
  if (!bus) {
    bus = await Bus.create({
      bus_number: normalized,
      bus_type: 'Route service',
      seating_capacity: 52,
      status: 'ACTIVE',
    });
    console.log(`Created bus ${normalized}`);
  } else {
    await bus.update({
      bus_type: 'Route service',
      seating_capacity: 52,
      status: 'ACTIVE',
    });
    console.log(`Updated bus ${normalized}`);
  }
  return bus;
}

async function ensureBusRoute(bus, route, shift) {
  if (!bus || !route || !shift) {
    return null;
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
      status: 'ACTIVE',
    });
    console.log(`Created bus route ${bus.bus_number} / ${route.route_number} / ${shift.shift_code}`);
  } else {
    await busRoute.update({ status: 'ACTIVE' });
    console.log(`Updated bus route ${bus.bus_number} / ${route.route_number} / ${shift.shift_code}`);
  }

  return busRoute;
}

async function ensureStop(stopName) {
  const normalized = String(stopName).trim().toLowerCase().replace(/\s+/g, ' ');
  let stop = await Stop.findOne({ where: { stop_name: normalized } });
  if (!stop) {
    stop = await Stop.create({
      stop_code: normalized.substring(0, 20).toUpperCase(),
      stop_name: normalized,
      status: 'ACTIVE',
    });
    console.log(`Created stop ${normalized}`);
  } else {
    await stop.update({ status: 'ACTIVE' });
    console.log(`Updated stop ${normalized}`);
  }
  return stop;
}

async function ensureBusRouteStop(busRoute, stop, stopSequence, pickupAllowed = true, dropAllowed = true) {
  if (!busRoute || !stop) {
    return;
  }

  const [busRouteStop, created] = await BusRouteStop.findOrCreate({
    where: {
      bus_route_id: busRoute.id,
      stop_id: stop.id,
    },
    defaults: {
      stop_sequence: Number(stopSequence),
      arrival_time: null,
      departure_time: null,
      pickup_allowed: pickupAllowed,
      drop_allowed: dropAllowed,
    },
  });

  if (!created) {
    await busRouteStop.update({
      stop_sequence: Number(stopSequence),
      pickup_allowed: pickupAllowed,
      drop_allowed: dropAllowed,
    });
  }
}

async function main() {
  console.log('');
  console.log('================================================');
  console.log('🚍 SEEDING SHIFT A/B/C ROUTES');
  console.log('================================================');

  await sequelize.sync();

  const shiftA = await ensureShift('A', 'A Shift', '04:55:00', '05:55:00');
  const shiftB = await ensureShift('B', 'B Shift', '12:50:00', '13:55:00');
  const shiftC = await ensureShift('C', 'C Shift', '20:50:00', '21:55:00');

  const routeA = await ensureRoute('SHIFT-A', 'A Shift Chandrapur To Plant', 'Chandrapur', 'Plant');
  const routeB = await ensureRoute('SHIFT-B', 'B Shift Chandrapur To Plant', 'Chandrapur', 'Plant');
  const routeC = await ensureRoute('SHIFT-C', 'C Shift Chandrapur To Plant', 'Chandrapur', 'Plant');

  const bus1 = await ensureBus('BUS-01');
  const bus7 = await ensureBus('BUS-07');

  const busRouteA1 = await ensureBusRoute(bus1, routeA, shiftA);
  const busRouteA7 = await ensureBusRoute(bus7, routeA, shiftA);
  const busRouteB1 = await ensureBusRoute(bus1, routeB, shiftB);
  const busRouteB7 = await ensureBusRoute(bus7, routeB, shiftB);
  const busRouteC1 = await ensureBusRoute(bus1, routeC, shiftC);
  const busRouteC7 = await ensureBusRoute(bus7, routeC, shiftC);

  const plantStop = await ensureStop('Plant');

  const sampleStops = [
    { name: 'Chandrapur', seq: 1 },
    { name: 'Main Gate', seq: 2 },
    { name: 'Bus Stop', seq: 3 },
  ];

  const busRoutes = [
    busRouteA1,
    busRouteA7,
    busRouteB1,
    busRouteB7,
    busRouteC1,
    busRouteC7,
  ];

  for (const busRoute of busRoutes) {
    if (!busRoute) continue;

    for (const stopInfo of sampleStops) {
      const stop = await ensureStop(stopInfo.name);
      await ensureBusRouteStop(busRoute, stop, stopInfo.seq, true, true);
    }

    await ensureBusRouteStop(busRoute, plantStop, 99, false, true);
  }

  console.log('');
  console.log('================================================');
  console.log('✅ SEED COMPLETED');
  console.log('================================================');

  await sequelize.close();
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
