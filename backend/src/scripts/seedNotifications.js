const { sequelize } = require('../config/database');
const { Notification, Employee, Bus, BusPassApplication } = require('../models');

async function main() {
  await sequelize.authenticate();
  console.log('DB connected\n');

  const employees = await Employee.findAll({ limit: 3 });
  const buses = await Bus.findAll({ limit: 3 });

  if (!employees.length || !buses.length) {
    console.log('Need at least 1 employee and 1 bus to seed notifications.');
    await sequelize.close();
    return;
  }

  const sampleNotifications = employees.flatMap((employee, empIndex) => {
    const bus = buses[empIndex % buses.length];
    return [
      {
        employee_code: employee.employee_code,
        type: 'BUS_STATUS_CHANGE',
        title: 'Bus service unavailable',
        message: `Bus ${bus.bus_number} is now INACTIVE. Your booking may be affected.`,
        payload: JSON.stringify({ bus_id: bus.id, bus_number: bus.bus_number, status: 'INACTIVE' }),
        read: false,
      },
      {
        employee_code: employee.employee_code,
        type: 'BOOKING_UPDATE',
        title: 'Booking confirmed',
        message: 'Your bus pass application has been approved.',
        payload: JSON.stringify({ application_id: 1 }),
        read: true,
        read_at: new Date(),
      },
      {
        employee_code: employee.employee_code,
        type: 'SYSTEM',
        title: 'Welcome to Lloyds Bus Management',
        message: 'You can now book seats, track buses, and manage your pass.',
        payload: null,
        read: false,
      },
    ];
  });

  await Notification.bulkCreate(sampleNotifications, { ignoreDuplicates: true });
  console.log(`Seeded ${sampleNotifications.length} notifications.`);

  await sequelize.close();
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
