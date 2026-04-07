const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

router.post('/log', calendarController.addEvent);
router.get('/dashboard', calendarController.getEvents);
router.delete('/:id', calendarController.deleteEvent);

module.exports = router;