const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Bus = sequelize.define(
  "Bus",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    bus_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    bus_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    registration_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },

    // Stored now for master-data readiness. Live tracking remains disabled
    // until the GPS provider API is supplied.
    gps_device_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    gps_api_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    seating_capacity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    vendor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    driver_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    conductor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "INACTIVE",
        "BREAKDOWN",
        "UNDER_MAINTENANCE"
      ),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "buses",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Bus;
