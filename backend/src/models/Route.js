const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Route = sequelize.define(
  "Route",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    route_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    route_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    source: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    destination: {
      type: DataTypes.STRING(150),
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
    tableName: "routes",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Route;