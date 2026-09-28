const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Driver = sequelize.define(
  "Driver",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    driver_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    driver_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    license_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    license_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    vendor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "drivers",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Driver;