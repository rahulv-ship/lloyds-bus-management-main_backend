const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const RouteStop = sequelize.define(
  "RouteStop",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    route_id: {
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

    pickup_allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    drop_allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    expected_arrival_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    tableName: "route_stops",
    timestamps: true,
    underscored: true,
  }
);

module.exports = RouteStop;