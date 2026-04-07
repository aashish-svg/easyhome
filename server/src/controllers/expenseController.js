const db = require('../config/db');

exports.addExpense = async (req, res) => {
    const { date, category, amount, description } = req.body;
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
    }

    try {
        await db.query(
            'INSERT INTO Expenses (date, category, amount, description) VALUES ($1, $2, $3, $4)',
            [date, category, parseFloat(amount), description || '']
        );
        res.status(201).json({ message: "Expense logged successfully" });
    } catch (error) {
        console.error("❌ EXPENSE_ADD_ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboard = async (req, res) => {
    const targetMonth = req.query.month || new Date().toISOString().slice(0, 7); 
    
    try {
        const totalResult = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total 
             FROM Expenses 
             WHERE to_char(date, 'YYYY-MM') = $1`,
            [targetMonth]
        );

        const historyResult = await db.query(
            `SELECT * FROM Expenses 
             WHERE to_char(date, 'YYYY-MM') = $1 
             ORDER BY date DESC, created_at DESC`,
            [targetMonth]
        );

        res.status(200).json({
            total: totalResult.rows[0].total,
            history: historyResult.rows
        });
    } catch (error) {
        console.error("❌ EXPENSE_DASHBOARD_ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        await db.query('DELETE FROM Expenses WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: "Expense deleted" });
    } catch (error) {
        console.error("❌ EXPENSE_DELETE_ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};