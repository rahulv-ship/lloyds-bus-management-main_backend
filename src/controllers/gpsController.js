const { Bus, BusGpsTracking } = require("../models");
const { Op } = require("sequelize");
const { syncWheelseyeData } = require("../services/gpsService");

const getLatestGps = async (req, res) => {
  try {
    const { bus_id } = req.query;

    const where = {};
    if (bus_id) where.bus_id = bus_id;

    const latest = await BusGpsTracking.findAll({
      where,
      include: [{ model: Bus, as: "bus", attributes: ["id", "bus_number", "bus_type", "registration_number", "seating_capacity"] }],
      order: [["created_date", "DESC"]],
      limit: bus_id ? 1 : 100,
    });

    return res.json({ success: true, data: latest });
  } catch (e) {
    console.error("getLatestGps error:", e);
    return res.status(500).json({ success: false, message: "Failed to fetch GPS data" });
  }
};

const getGpsHistory = async (req, res) => {
  try {
    const { bus_id, from, to, limit = 200 } = req.query;

    if (!bus_id) {
      return res.status(400).json({ success: false, message: "bus_id is required" });
    }

    const where = { bus_id };
    if (from || to) {
      where.created_date = {};
      if (from) where.created_date[Op.gte] = parseInt(from);
      if (to) where.created_date[Op.lte] = parseInt(to);
    }

    const history = await BusGpsTracking.findAll({
      where,
      order: [["created_date", "ASC"]],
      limit: parseInt(limit),
    });

    return res.json({ success: true, data: history });
  } catch (e) {
    console.error("getGpsHistory error:", e);
    return res.status(500).json({ success: false, message: "Failed to fetch GPS history" });
  }
};

const triggerGpsSync = async (req, res) => {
  try {
    const result = await syncWheelseyeData();
    return res.json(result);
  } catch (e) {
    console.error("triggerGpsSync error:", e);
    return res.status(500).json({ success: false, message: "Sync failed" });
  }
};

const getBusesWithGps = async (req, res) => {
  try {
    const buses = await Bus.findAll({
      include: [{
        model: BusGpsTracking,
        as: "gps_history",
        limit: 1,
        order: [["created_date", "DESC"]],
        required: false,
      }],
      order: [["bus_number", "ASC"]],
    });

    return res.json({ success: true, data: buses });
  } catch (e) {
    console.error("getBusesWithGps error:", e);
    return res.status(500).json({ success: false, message: "Failed to fetch buses with GPS" });
  }
};

module.exports = {
  getLatestGps,
  getGpsHistory,
  triggerGpsSync,
  getBusesWithGps,
};