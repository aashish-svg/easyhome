const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Note: Server will fail to start until these route files are created and export a valid Express router.
const milkRoutes = require('./routes/milkRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const helpRoutes = require('./routes/helpRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const udhaarRoutes = require('./routes/udhaarRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const lookupRoutes = require('./routes/lookupRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');


app.use('/api/milk', milkRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/udhaar', udhaarRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/lookups', lookupRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

module.exports = app;