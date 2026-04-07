const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');

router.post('/maid', helpController.addMaid);
router.put('/maid/:id/remove', helpController.removeMaid);
router.post('/attendance', helpController.logAttendance);
router.post('/payment', helpController.addPayment);
router.get('/dashboard', helpController.getDashboard);

module.exports = router;