const { sequelize } = require('../config/database');
const { Shift, Route, BusRoute, BusRouteStop, Stop } = require('../models');

async function main() {
  await sequelize.authenticate();
  console.log('DB connected\n');

  const shifts = await Shift.findAll({ order: [['id', 'ASC']] });
  console.log('SHIFTS');
  console.log(shifts.map(s => `${s.id} | ${s.shift_code} | ${s.shift_name} | ${s.status}`).join('\n'));

  const routes = await Route.findAll({ where: { route_number: ['SHIFT-A', 'SHIFT-B', 'SHIFT-C'] }, order: [['id', 'ASC']] });
  console.log('\nROUTES');
  console.log(routes.map(r => `${r.id} | ${r.route_number} | ${r.route_name} | ${r.source} -> ${r.destination} | ${r.status}`).join('\n'));

  const busRoutes = await BusRoute.findAll({
    where: { status: 'ACTIVE' },
    include: [
      { model: Shift, as: 'shift', required: true },
      { model: Route, as: 'route', required: true },
      { model: require('../models').Bus, as: 'bus', required: true },
    ],
    order: [['id', 'ASC']],
  });
  console.log('\nBUS ROUTES');
  console.log(busRoutes.map(br => `${br.id} | ${br.bus?.bus_number} | ${br.route?.route_number} | ${br.shift?.shift_code} | ${br.status}`).join('\n'));

  const routeIds = routes.map(r => r.id);
  const stops = await BusRouteStop.findAll({
    where: { bus_route_id: [...new Set(busRoutes.map(br => br.id))] },
    include: [{ model: Stop, as: 'stop', required: true }],
    order: [['bus_route_id', 'ASC'], ['stop_sequence', 'ASC']],
  });
  console.log('\nBUS ROUTE STOPS');
  console.log(stops.map(s => `${s.bus_route_id} | ${s.stop?.stop_name} | seq=${s.stop_sequence} | pickup=${String(s.pickup_allowed)} | drop=${String(s.drop_allowed)}`).join('\n'));

  await sequelize.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
