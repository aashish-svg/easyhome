const express = require('express');
const router = express.Router();
const lookupController = require('../controllers/lookupController');

router.get('/expense-descriptions', lookupController.getExpenseDescriptions);

module.exports = router;