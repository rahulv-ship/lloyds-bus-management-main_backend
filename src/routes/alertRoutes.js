const express = require('express');
const {
  getAlerts,
  acknowledgeAlert,
  acknowledgeAllAlerts,
  createAlert,
} = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getAlerts);
router.put('/:id/acknowledge', acknowledgeAlert);
router.put('/acknowledge-all', acknowledgeAllAlerts);

router.post('/', authorize('ADMIN'), createAlert);

module.exports = router;
