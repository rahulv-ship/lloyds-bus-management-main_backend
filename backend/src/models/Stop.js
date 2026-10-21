const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Stop = sequelize.define(
  "Stop",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    stop_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    stop_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "stops",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Stop;