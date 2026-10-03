const { sequelize } = require('../config/database');
const { Alert, Employee, BusPassApplication, Bus, Route, Shift, Stop } = require('../models');

async function main() {
  await sequelize.authenticate();
  console.log('DB connected\n');

  const employees = await Employee.findAll({ limit: 3 });
  const buses = await Bus.findAll({ limit: 3 });
  const routes = await Route.findAll({ limit: 3 });
  const shifts = await Shift.findAll({ limit: 3 });

  if (!employees.length || !buses.length || !routes.length || !shifts.length) {
    console.log('Need at least 1 employee, bus, route, and shift to seed alerts.');
    await sequelize.close();
    return;
  }

  const sampleAlerts = [
    {
      type: 'BUS_FULLY_BOOKED',
      category: 'CAPACITY',
      severity: 'CRITICAL',
      title: 'Bus is fully booked',
      message: `${buses[0].bus_number} is fully booked on 2026-10-02. No seats are available.`,
      payload: JSON.stringify({ bus_id: buses[0].id, route_id: routes[0].id, shift_id: shifts[0].id, booking_date: '2026-10-02', booked: 52, capacity: 52 }),
      employee_code: employees[0]?.employee_code || null,
    },
    {
      type: 'HIGH_OCCUPANCY',
      category: 'CAPACITY',
      severity: 'WARNING',
      title: 'Occupancy exceeds threshold',
      message: `${buses[1].bus_number} has reached 92% occupancy on 2026-10-03.`,
      payload: JSON.stringify({ bus_id: buses[1]?.id, route_id: routes[1]?.id, shift_id: shifts[1]?.id, booking_date: '2026-10-03', booked: 48, capacity: 52, percentage: 92 }),
      employee_code: employees[1]?.employee_code || null,
    },
    {
      type: 'UNUSED_CAPACITY',
      category: 'CAPACITY',
      severity: 'INFO',
      title: 'Significant unused capacity',
      message: `${buses[2].bus_number} has only 18% occupancy with 42 seats available on 2026-10-04.`,
      payload: JSON.stringify({ bus_id: buses[2]?.id, route_id: routes[2]?.id, shift_id: shifts[2]?.id, booking_date: '2026-10-04', booked: 10, capacity: 52, available: 42, percentage: 18 }),
      employee_code: employees[2]?.employee_code || null,
    },
    {
      type: 'MULTIPLE_BOOKING',
      category: 'BOOKING',
      severity: 'WARNING',
      title: 'Multiple booking attempt detected',
      message: `Employee ${employees[0]?.employee_code} attempted to book another bus while an existing application is still active.`,
      payload: JSON.stringify({ employee_id: employees[0]?.employee_code, existing_application_number: 'BP-2026-000001', existing_status: 'PENDING_APPROVAL' }),
      employee_code: employees[0]?.employee_code || null,
    },
    {
      type: 'UNAUTHORIZED_TRAVEL',
      category: 'SECURITY',
      severity: 'CRITICAL',
      title: 'Unauthorized travel detected',
      message: `Employee ${employees[1]?.employee_code} attempted to book bus ${buses[1]?.bus_number} on 2026-10-05 while already having an approved booking on bus ${buses[0]?.bus_number}.`,
      payload: JSON.stringify({ employee_id: employees[1]?.employee_code, new_bus_id: buses[1]?.id, existing_bus_id: buses[0]?.id, booking_date: '2026-10-05', existing_application_id: 1 }),
      employee_code: employees[1]?.employee_code || null,
    },
  ];

  await Alert.bulkCreate(sampleAlerts, { ignoreDuplicates: true });
  console.log(`Seeded ${sampleAlerts.length} alerts.`);

  await sequelize.close();
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
