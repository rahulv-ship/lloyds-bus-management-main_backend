const { Op } = require('sequelize');
const {
  Bus, Route, Stop, Shift, Vendor, Driver, Conductor, BusRoute,
  BusRouteStop, BusPassApplication, BusPassBookingDate, Employee, Notification, Alert,
} = require('../models');

const MASTER_MODELS = {
  buses: Bus,
  routes: Route,
  stops: Stop,
  shifts: Shift,
  vendors: Vendor,
  drivers: Driver,
  conductors: Conductor,
  'bus-routes': BusRoute,
};

const busIncludes = [
  { model: Vendor, as: 'vendor', required: false },
  { model: Driver, as: 'driver', required: false },
  { model: Conductor, as: 'conductor', required: false },
];
const busRouteIncludes = [
  { model: Bus, as: 'bus', required: false },
  { model: Route, as: 'route', required: false },
  { model: Shift, as: 'shift', required: false },
];
const includesFor = (entity) => entity === 'buses' ? busIncludes : entity === 'bus-routes' ? busRouteIncludes : [];

const getMasterRecords = async (req, res) => {
  const { entity } = req.params;
  const Model = MASTER_MODELS[entity];
  if (!Model) return res.status(404).json({ success: false, message: 'Unknown master-data entity' });
  try {
    const data = await Model.findAll({ include: includesFor(entity), order: [['id', 'DESC']] });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sanitizeMasterPayload = (payload) => {
  const cleaned = { ...payload }
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === '' || cleaned[key] === undefined || cleaned[key] === null) {
      cleaned[key] = null
    }
  })
  return cleaned
};

const createMasterRecord = async (req, res) => {
  const Model = MASTER_MODELS[req.params.entity];
  if (!Model) return res.status(404).json({ success: false, message: 'Unknown master-data entity' });
  try {
    const record = await Model.create(sanitizeMasterPayload(req.body));
    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.errors?.map((item) => item.message).join(', ') || error.message });
  }
};

const updateMasterRecord = async (req, res) => {
  const Model = MASTER_MODELS[req.params.entity];
  if (!Model) return res.status(404).json({ success: false, message: 'Unknown master-data entity' });
  try {
    const record = await Model.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    const previousStatus = record.status;
    await record.update(sanitizeMasterPayload(req.body));
    const updated = await Model.findByPk(req.params.id);

    if (req.params.entity === 'buses' && previousStatus !== updated.status && ['INACTIVE', 'BREAKDOWN', 'UNDER_MAINTENANCE'].includes(updated.status)) {
      const affectedApplications = await BusPassApplication.findAll({
        where: {
          bus_id: updated.id,
          status: { [Op.in]: ['PENDING_APPROVAL', 'APPROVED'] },
        },
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['employee_code', 'employee_name'],
          },
        ],
      });

      const uniqueEmployees = [...new Map(affectedApplications.map((app) => [app.employee?.employee_code, app.employee])).values()].filter(Boolean);

      if (uniqueEmployees.length) {
        const notifications = uniqueEmployees.map((employee) => ({
          employee_code: employee.employee_code,
          type: 'BUS_STATUS_CHANGE',
          title: 'Bus service unavailable',
          message: `Bus ${updated.bus_number} is now ${updated.status}. Your booking may be affected.`,
          payload: JSON.stringify({ bus_id: updated.id, bus_number: updated.bus_number, status: updated.status }),
        }));

        await Notification.bulkCreate(notifications);
      }
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.errors?.map((item) => item.message).join(', ') || error.message });
  }
};

const deleteMasterRecord = async (req, res) => {
  const Model = MASTER_MODELS[req.params.entity];
  if (!Model) return res.status(404).json({ success: false, message: 'Unknown master-data entity' });
  try {
    const record = await Model.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    await record.destroy();
    return res.json({ success: true, message: 'Master record deleted' });
  } catch (_error) {
    return res.status(409).json({ success: false, message: 'This record is in use and cannot be deleted. Mark it inactive instead.' });
  }
};

const getActiveEmployees = async (_req, res) => {
  try {
    const data = await Employee.findAll({ where: { status: 'ACTIVE' }, attributes: ['employee_code', 'employee_name', 'department', 'designation'], order: [['employee_name', 'ASC']] });
    return res.json({ success: true, data });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const getEmployeeByCode = async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const employee = await Employee.findOne({
      where: { employee_code: employeeCode, status: 'ACTIVE' },
      attributes: ['employee_code', 'employee_name', 'department', 'designation'],
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    return res.json({ success: true, data: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboard = async (_req, res) => {
  try {
    const [buses, activeBuses, routes, activeRoutes, pending, activeServices] = await Promise.all([
      Bus.count(), Bus.count({ where: { status: 'ACTIVE' } }), Route.count(), Route.count({ where: { status: 'ACTIVE' } }),
      BusPassApplication.count({ where: { status: 'PENDING_APPROVAL' } }),
      BusRoute.findAll({ where: { status: 'ACTIVE' }, include: busRouteIncludes }),
    ]);
    const utilization = await Promise.all(activeServices.map(async (service) => {
      const capacity = Number(service.employee_capacity || service.bus?.seating_capacity || 52);
      const booked = await BusPassApplication.count({ where: { bus_id: service.bus_id, shift_id: service.shift_id, status: { [Op.in]: ['PENDING_APPROVAL', 'APPROVED'] } } });
      return { bus_route_id: service.id, bus_number: service.bus?.bus_number, route_number: service.route?.route_number, shift_name: service.shift?.shift_name, capacity, booked, available: Math.max(capacity - booked, 0) };
    }));
    const alerts = utilization.flatMap((item) => {
      const percent = item.capacity ? (item.booked / item.capacity) * 100 : 0;
      if (item.available === 0) return [{ tone: 'danger', message: `${item.bus_number} is fully booked.` }];
      if (percent >= 85) return [{ tone: 'warning', message: `${item.bus_number} is at ${Math.round(percent)}% occupancy.` }];
      if (item.booked > 0 && percent <= 25) return [{ tone: 'info', message: `${item.bus_number} has significant unused capacity (${item.available} seats).` }];
      return [];
    });

    for (const item of utilization) {
      const percent = item.capacity ? (item.booked / item.capacity) * 100 : 0;
      if (item.available === 0) {
        await Alert.create({
          type: 'BUS_FULLY_BOOKED',
          category: 'CAPACITY',
          severity: 'CRITICAL',
          title: 'Bus is fully booked',
          message: `${item.bus_number} is fully booked on all scheduled services.`,
          payload: JSON.stringify({ bus_route_id: item.bus_route_id, bus_number: item.bus_number, route_number: item.route_number, shift_name: item.shift_name, booked: item.booked, capacity: item.capacity }),
        });
      } else if (percent >= 85) {
        await Alert.create({
          type: 'HIGH_OCCUPANCY',
          category: 'CAPACITY',
          severity: 'WARNING',
          title: 'Occupancy exceeds threshold',
          message: `${item.bus_number} has reached ${Math.round(percent)}% occupancy for ${item.shift_name}.`,
          payload: JSON.stringify({ bus_route_id: item.bus_route_id, bus_number: item.bus_number, route_number: item.route_number, shift_name: item.shift_name, booked: item.booked, capacity: item.capacity, percentage: Math.round(percent) }),
        });
      } else if (item.booked > 0 && percent <= 25) {
        await Alert.create({
          type: 'UNUSED_CAPACITY',
          category: 'CAPACITY',
          severity: 'INFO',
          title: 'Significant unused capacity',
          message: `${item.bus_number} has only ${Math.round(percent)}% occupancy with ${item.available} seats available.`,
          payload: JSON.stringify({ bus_route_id: item.bus_route_id, bus_number: item.bus_number, route_number: item.route_number, shift_name: item.shift_name, booked: item.booked, capacity: item.capacity, available: item.available, percentage: Math.round(percent) }),
        });
      }
    }

    return res.json({ success: true, data: { stats: { buses, activeBuses, routes, activeRoutes, pending }, utilization, alerts } });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const getMasterReport = async (_req, res) => {
  try {
    const [buses, routes, stops, shifts, vendors, drivers, conductors, services] = await Promise.all([
      Bus.findAll({ include: busIncludes }), Route.findAll(), Stop.findAll(), Shift.findAll(), Vendor.findAll(), Driver.findAll({ include: busIncludes.slice(0, 1) }), Conductor.findAll({ include: busIncludes.slice(0, 1) }), BusRoute.findAll({ include: busRouteIncludes }),
    ]);
    return res.json({ success: true, generated_at: new Date(), data: { buses, routes, stops, shifts, vendors, drivers, conductors, services } });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { getMasterRecords, createMasterRecord, updateMasterRecord, deleteMasterRecord, getActiveEmployees, getEmployeeByCode, getDashboard, getMasterReport };
