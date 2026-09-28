const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const BusRoute = sequelize.define(
  "BusRoute",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    bus_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    route_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    shift_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    employee_capacity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    contracted_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "bus_routes",
    timestamps: true,
    underscored: true,
  }
);

module.exports = BusRoute;