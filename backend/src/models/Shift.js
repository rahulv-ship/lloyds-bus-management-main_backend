const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Shift = sequelize.define(
  "Shift",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    shift_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    shift_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "shifts",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Shift;