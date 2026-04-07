const express = require('express');
const router = express.Router();
const milkController = require('../controllers/milkController');

router.post('/log', milkController.logMilk);
router.get('/dashboard', milkController.getMilkDashboard);
router.delete('/:id', milkController.deleteEntry);

module.exports = router;