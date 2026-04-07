const db = require('../config/db');

exports.addMaid = async (req, res) => {
    const { name, salary, start_date } = req.body;
    try {
        await db.query(
            'INSERT INTO Maids (name, salary, start_date) VALUES ($1, $2, $3)',
            [name, parseFloat(salary), start_date]
        );
        res.status(201).json({ message: "Maid added" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeMaid = async (req, res) => {
    try {
        await db.query('UPDATE Maids SET is_active = FALSE WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: "Maid deactivated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logAttendance = async (req, res) => {
    const { date, entries } = req.body;
    try {
        for (const entry of entries) {
            await db.query(
                `INSERT INTO Maid_Attendance (maid_id, date, status)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (maid_id, date) 
                 DO UPDATE SET status = EXCLUDED.status`,
                [entry.maid_id, date, parseFloat(entry.status)]
            );
        }
        res.status(200).json({ message: "Attendance logged" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addPayment = async (req, res) => {
    const { maid_id, date, amount, remark } = req.body;
    try {
        await db.query(
            'INSERT INTO Maid_Payments (maid_id, date, amount, remark) VALUES ($1, $2, $3, $4)',
            [maid_id, date, parseFloat(amount), remark]
        );
        res.status(201).json({ message: "Payment recorded" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboard = async (req, res) => {
    const targetMonth = req.query.month || new Date().toISOString().slice(0, 7);
    try {
        const maidsResult = await db.query('SELECT * FROM Maids ORDER BY created_at ASC');
        const attendanceResult = await db.query(
            `SELECT * FROM Maid_Attendance WHERE to_char(date, 'YYYY-MM') = $1`,
            [targetMonth]
        );
        
        // Calculate financial aggregates on backend for absolute accuracy
        const financialsResult = await db.query(`
            WITH Earned AS (
                SELECT 
                    a.maid_id,
                    SUM(a.status * (m.salary / EXTRACT(DAY FROM (date_trunc('month', a.date) + interval '1 month - 1 day')))) as total_earned
                FROM Maid_Attendance a
                JOIN Maids m ON a.maid_id = m.id
                GROUP BY a.maid_id
            ),
            Paid AS (
                SELECT maid_id, SUM(amount) as total_paid
                FROM Maid_Payments
                GROUP BY maid_id
            )
            SELECT 
                m.id as maid_id,
                COALESCE(e.total_earned, 0) as all_time_earned,
                COALESCE(p.total_paid, 0) as all_time_paid
            FROM Maids m
            LEFT JOIN Earned e ON m.id = e.maid_id
            LEFT JOIN Paid p ON m.id = p.maid_id
        `);

        res.status(200).json({
            maids: maidsResult.rows,
            attendance: attendanceResult.rows,
            financials: financialsResult.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};