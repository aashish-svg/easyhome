const db = require('../config/db');

exports.getExpenseDescriptions = async (req, res) => {
    try {
        const result = await db.query('SELECT DISTINCT description FROM Expense_Ledger');
        res.status(200).json(result.rows.map(row => row.description));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};