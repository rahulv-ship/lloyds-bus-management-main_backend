const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const BusPassBookingDate = sequelize.define(
  "BusPassBookingDate",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

   bus_pass_application_id: {
  type: DataTypes.BIGINT.UNSIGNED,
  allowNull: false,
},
    booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "BOOKED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "BOOKED",
    },
  },
  {
    tableName: "bus_pass_booking_dates",
    timestamps: true,
  }
);

module.exports = BusPassBookingDate;