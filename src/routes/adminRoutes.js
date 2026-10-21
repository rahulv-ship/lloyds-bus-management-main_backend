const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getMasterRecords, createMasterRecord, updateMasterRecord, deleteMasterRecord, getActiveEmployees, getEmployeeByCode, getDashboard, getMasterReport } = require('../controllers/adminController');
const { getLatestGps, getGpsHistory, triggerGpsSync, getBusesWithGps } = require('../controllers/gpsController');

router.use(authenticate, authorize('ADMIN'));
router.get('/dashboard', getDashboard);
router.get('/master-report', getMasterReport);
router.get('/employees', getActiveEmployees);
router.get('/employees/:employeeCode', getEmployeeByCode);
router.get('/master/:entity', getMasterRecords);
router.post('/master/:entity', createMasterRecord);
router.put('/master/:entity/:id', updateMasterRecord);
router.delete('/master/:entity/:id', deleteMasterRecord);

// GPS Tracking
router.get('/gps/latest', getLatestGps);
router.get('/gps/history', getGpsHistory);
router.get('/gps/buses', getBusesWithGps);
router.post('/gps/sync', triggerGpsSync);

module.exports = router;
