const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const BusRouteStop = sequelize.define(
  "BusRouteStop",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    bus_route_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    stop_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    stop_sequence: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    arrival_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    departure_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    pickup_allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    drop_allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "bus_route_stops",
    timestamps: true,
    underscored: true,
  }
);

module.exports = BusRouteStop;