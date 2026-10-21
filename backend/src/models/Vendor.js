const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Vendor = sequelize.define(
  "Vendor",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    vendor_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    vendor_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    contact_person: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "vendors",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Vendor;