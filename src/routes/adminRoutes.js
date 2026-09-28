const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getMasterRecords, createMasterRecord, updateMasterRecord, deleteMasterRecord, getActiveEmployees, getEmployeeByCode, getDashboard, getMasterReport } = require('../controllers/adminController');

router.use(authenticate, authorize('ADMIN'));
router.get('/dashboard', getDashboard);
router.get('/master-report', getMasterReport);
router.get('/employees', getActiveEmployees);
router.get('/employees/:employeeCode', getEmployeeByCode);
router.get('/master/:entity', getMasterRecords);
router.post('/master/:entity', createMasterRecord);
router.put('/master/:entity/:id', updateMasterRecord);
router.delete('/master/:entity/:id', deleteMasterRecord);
module.exports = router;
