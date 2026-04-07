const db = require('../config/db');

exports.logMilk = async (req, res) => {
    const { date, entries } = req.body;
    try {
        for (const entry of entries) {
            const rate = parseFloat(entry.rate);
            const qty = parseFloat(entry.qty);
            if (isNaN(rate) || isNaN(qty)) continue;

            await db.query(
                `INSERT INTO Milk_Log (date, milk_type, rate_per_liter, quantity_liters)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (date, milk_type) 
                 DO UPDATE SET 
                    rate_per_liter = EXCLUDED.rate_per_liter,
                    quantity_liters = EXCLUDED.quantity_liters`,
                [date, entry.milk_type, rate, qty]
            );
        }
        res.status(201).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMilkDashboard = async (req, res) => {
    // Allows fetching data for specific months via query params, defaults to current month
    const targetMonth = req.query.month || new Date().toISOString().slice(0, 7); 
    
    try {
        const summaryResult = await db.query(
            `SELECT 
                COALESCE(SUM(quantity_liters), 0) as total_liters,
                COALESCE(SUM(total_amount), 0) as total_cost
             FROM Milk_Log 
             WHERE to_char(date, 'YYYY-MM') = $1`,
            [targetMonth]
        );

        const historyResult = await db.query(
            `SELECT id, date, milk_type, rate_per_liter, quantity_liters, total_amount 
             FROM Milk_Log 
             WHERE to_char(date, 'YYYY-MM') = $1
             ORDER BY date DESC, milk_type ASC`,
            [targetMonth]
        );

        res.status(200).json({
            summary: {
                ...summaryResult.rows[0],
                past_balance: 0 // Modify if calculating from past months in the future
            },
            history: historyResult.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEntry = async (req, res) => {
    try {
        await db.query('DELETE FROM Milk_Log WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};