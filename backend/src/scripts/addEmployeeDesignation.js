const { sequelize } = require('../config/database');

async function main() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('employees');

  if (!table.designation) {
    await sequelize.query(`ALTER TABLE employees ADD COLUMN designation VARCHAR(150) NULL AFTER department`);
    console.log('Added employees.designation');
  } else {
    console.log('employees.designation already exists');
  }

  await sequelize.close();
}

main().catch((error) => { console.error(error); process.exit(1); });
