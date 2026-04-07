const db = require('../config/db');

exports.addUdhaar = async (req, res) => {
    const { person_name, transaction_type, amount, reason, date } = req.body;
    try {
        await db.query(
            'INSERT INTO Udhaar_Entries (person_name, transaction_type, amount, reason, date) VALUES ($1, $2, $3, $4, $5)',
            [person_name, transaction_type, parseFloat(amount), reason || '', date]
        );
        res.status(201).json({ message: "Entry logged" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUnifiedLedger = async (req, res) => {
    try {
        const query = `
            SELECT 
                id, date, 'Udhaar' as source, person_name as entity, 
                transaction_type, amount, reason as description, created_at 
            FROM Udhaar_Entries
            
            UNION ALL
            
            SELECT 
                id, date, 'Milk' as source, 'Milkman' as entity, 
                'EXPENSE' as transaction_type, total_amount as amount, milk_type as description, created_at 
            FROM Milk_Log
            
            UNION ALL
            
            SELECT 
                p.id, p.date, 'Maid' as source, m.name as entity, 
                'EXPENSE' as transaction_type, p.amount, p.remark as description, p.created_at 
            FROM Maid_Payments p
            JOIN Maids m ON p.maid_id = m.id
            
            UNION ALL
            
            SELECT 
                id, date, 'Expense' as source, category as entity, 
                'EXPENSE' as transaction_type, amount, description, created_at 
            FROM Expenses
            
            ORDER BY date DESC, created_at DESC
        `;
        
        const result = await db.query(query);
        
        let total_lent = 0;
        let total_borrowed = 0;
        let total_expense = 0;

        result.rows.forEach(row => {
            const amt = parseFloat(row.amount);
            if (row.transaction_type === 'LEND') total_lent += amt;
            if (row.transaction_type === 'BORROW') total_borrowed += amt;
            if (row.transaction_type === 'EXPENSE') total_expense += amt;
        });

        res.status(200).json({
            ledger: result.rows,
            summary: { total_lent, total_borrowed, total_expense }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUdhaar = async (req, res) => {
    try {
        await db.query('DELETE FROM Udhaar_Entries WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};