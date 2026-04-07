const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');

router.post('/schedule', recurringController.addSchedule);
router.post('/pay', recurringController.logPayment);
router.get('/dashboard', recurringController.getDashboard);
router.delete('/:id', recurringController.deleteSchedule);

module.exports = router;