const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Employee = sequelize.define(
  "Employee",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    employee_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    employee_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    department: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    designation: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    date_of_joining: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    photograph: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "employees",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Employee;