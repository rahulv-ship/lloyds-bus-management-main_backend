const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const BusPassApplication = sequelize.define(
  "BusPassApplication",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    application_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    employee_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
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

    pickup_stop_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    drop_stop_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "DRAFT",
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "DRAFT",
    },

    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    approved_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    rejected_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    rejected_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    pass_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },

    pass_valid_from: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    pass_valid_to: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    qr_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },

    qr_generated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    approved_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "bus_pass_applications",
    timestamps: true,
    underscored: true,
  }
);

module.exports = BusPassApplication;