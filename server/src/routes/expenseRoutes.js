const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.post('/log', expenseController.addExpense);
router.get('/dashboard', expenseController.getDashboard);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;