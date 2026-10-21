const { Op } = require('sequelize');
const { Alert, Employee, BusPassApplication, Bus, Route, Shift, Stop, BusRoute } = require('../models');

const getAlerts = async (req, res) => {
  try {
    const employeeId = req.user?.employee_id || req.user?.employeeId;
    const { category, severity, acknowledged } = req.query;

    const where = {};

    if (employeeId) {
      where.employee_code = employeeId;
    }

    if (category) {
      where.category = category;
    }

    if (severity) {
      where.severity = severity;
    }

    if (acknowledged !== undefined) {
      where.acknowledged = acknowledged === 'true';
    }

    const alerts = await Alert.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    const unreadCount = await Alert.count({
      where: { ...where, acknowledged: false },
    });

    return res.json({ success: true, alerts, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user?.employee_id || req.user?.employeeId;

    const alert = await Alert.findOne({
      where: { id, employee_code: employeeId },
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.acknowledged = true;
    alert.acknowledged_at = new Date();
    alert.acknowledged_by = employeeId;
    await alert.save();

    return res.json({ success: true, data: alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const acknowledgeAllAlerts = async (req, res) => {
  try {
    const employeeId = req.user?.employee_id || req.user?.employeeId;

    await Alert.update(
      { acknowledged: true, acknowledged_at: new Date(), acknowledged_by: employeeId },
      { where: { employee_code: employeeId, acknowledged: false } }
    );

    return res.json({ success: true, message: 'All alerts acknowledged' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAlert = async (req, res) => {
  try {
    const { type, category, severity, title, message, payload, employee_code } = req.body;

    const alert = await Alert.create({
      type,
      category: category || 'SYSTEM',
      severity: severity || 'INFO',
      title,
      message,
      payload: payload ? JSON.stringify(payload) : null,
      employee_code: employee_code || req.user?.employee_id || req.user?.employeeId,
    });

    return res.status(201).json({ success: true, data: alert });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAlerts, acknowledgeAlert, acknowledgeAllAlerts, createAlert };
