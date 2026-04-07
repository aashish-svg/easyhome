const express = require('express');
const router = express.Router();
const udhaarController = require('../controllers/udhaarController');

router.post('/log', udhaarController.addUdhaar);
router.get('/dashboard', udhaarController.getUnifiedLedger);
router.delete('/:id', udhaarController.deleteUdhaar);

module.exports = router;