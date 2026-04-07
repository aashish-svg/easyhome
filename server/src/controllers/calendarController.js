const db = require('../config/db');

exports.addEvent = async (req, res) => {
    const { date, event_type, description } = req.body;
    try {
        await db.query(
            'INSERT INTO Calendar_Events (date, event_type, description) VALUES ($1, $2, $3)',
            [date, event_type, description || '']
        );
        res.status(201).json({ message: "Event added" });
    } catch (error) {
        console.error("CALENDAR_ADD_ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getEvents = async (req, res) => {
    const targetMonth = req.query.month || new Date().toISOString().slice(0, 7); 
    try {
        const result = await db.query(
            `SELECT * FROM Calendar_Events 
             WHERE to_char(date, 'YYYY-MM') = $1 
             ORDER BY date ASC, created_at ASC`,
            [targetMonth]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("CALENDAR_GET_ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        await db.query('DELETE FROM Calendar_Events WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        console.error("CALENDAR_DELETE_ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};