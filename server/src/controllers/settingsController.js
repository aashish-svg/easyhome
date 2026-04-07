const db = require('../config/db');

exports.getSettings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM App_Settings WHERE id = 1');
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};