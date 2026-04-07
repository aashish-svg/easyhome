const db = require('../config/db');

exports.addSchedule = async (req, res) => {
    const { name, category, total_amount, installment_amount, interval_type, start_date } = req.body;
    try {
        await db.query(
            `INSERT INTO Recurring_Schedules (name, category, total_amount, installment_amount, interval_type, start_date) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, category, parseFloat(total_amount), parseFloat(installment_amount), interval_type, start_date]
        );
        res.status(201).json({ message: "Schedule created" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logPayment = async (req, res) => {
    const { schedule_id, due_date, amount_paid, paid_on } = req.body;
    try {
        await db.query(
            `INSERT INTO Recurring_Payments (schedule_id, due_date, paid_on, amount_paid) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (schedule_id, due_date) DO NOTHING`,
            [schedule_id, due_date, paid_on, parseFloat(amount_paid)]
        );
        res.status(200).json({ message: "Payment logged" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const schedules = await db.query('SELECT * FROM Recurring_Schedules ORDER BY created_at ASC');
        const payments = await db.query('SELECT * FROM Recurring_Payments');
        res.status(200).json({
            schedules: schedules.rows,
            payments: payments.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        await db.query('DELETE FROM Recurring_Schedules WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: "Schedule deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};