const { Op } = require('sequelize');
const { Employee, BusPassApplication, BusPassBookingDate, Notification } = require('../models');

const getMyNotifications = async (req, res) => {
  try {
    const employeeId = req.user?.employee_id || req.user?.employeeId;
    if (!employeeId) {
      return res.status(403).json({ success: false, message: 'Employee ID missing from session' });
    }

    const notifications = await Notification.findAll({
      where: { employee_code: employeeId },
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    const unreadCount = await Notification.count({
      where: { employee_code: employeeId, read: false },
    });

    return res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const employeeId = req.user?.employee_id || req.user?.employeeId;
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, employee_code: employeeId },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.read = true;
    notification.read_at = new Date();
    await notification.save();

    return res.json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const employeeId = req.user?.employee_id || req.user?.employeeId;

    await Notification.update(
      { read: true, read_at: new Date() },
      { where: { employee_code: employeeId, read: false } }
    );

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyNotifications, markNotificationRead, markAllNotificationsRead };
