const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log,
    timezone: "+05:30",
  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();

    console.log("✅ MySQL database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error.message);

    throw error;
  }
};

module.exports = {
  sequelize,
  connectDatabase,
};