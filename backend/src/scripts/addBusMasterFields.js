const { sequelize } = require('../config/database');

async function main() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('buses');
  const fields = {
    registration_number: 'VARCHAR(50) NULL UNIQUE',
    gps_device_id: 'VARCHAR(100) NULL',
    gps_api_details: 'TEXT NULL',
  };

  for (const [name, definition] of Object.entries(fields)) {
    if (!table[name]) {
      await sequelize.query(`ALTER TABLE buses ADD COLUMN ${name} ${definition}`);
      console.log(`Added buses.${name}`);
    }
  }
  await sequelize.close();
}

main().catch((error) => { console.error(error); process.exit(1); });
