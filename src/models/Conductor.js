const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Conductor = sequelize.define(
  "Conductor",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    conductor_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    conductor_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
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
    tableName: "conductors",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Conductor;