const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Alert = sequelize.define(
  "Alert",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    severity: {
      type: DataTypes.ENUM("INFO", "WARNING", "CRITICAL"),
      allowNull: false,
      defaultValue: "INFO",
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    payload: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    acknowledged: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    acknowledged_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    acknowledged_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "alerts",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Alert;
