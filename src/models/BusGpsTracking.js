const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Bus = require("./Bus");

const BusGpsTracking = sequelize.define(
  "BusGpsTracking",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    bus_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: "buses", key: "id" },
    },

    vehicle_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    device_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    vendor_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    vendor_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },

    speed: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    angle: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
    },

    ignition: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    accurate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "WHEELSEYE",
    },

    vehicle_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    created_date: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    created_date_readable: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    dttime: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    dttime_in_epoch: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    server_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    raw_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "bus_gps_tracking",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["bus_id"] },
      { fields: ["vehicle_number"] },
      { fields: ["created_date"] },
      { fields: ["latitude", "longitude"] },
    ],
  }
);

BusGpsTracking.belongsTo(Bus, { foreignKey: "bus_id", as: "bus" });
Bus.hasMany(BusGpsTracking, { foreignKey: "bus_id", as: "gps_history" });

module.exports = BusGpsTracking;