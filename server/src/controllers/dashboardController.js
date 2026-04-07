const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    const today = new Date();
    const monthStr = today.toISOString().slice(0, 7);
    const todayStr = today.toISOString().split('T')[0];
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    try {
        const budgetRes = await db.query('SELECT budget FROM Monthly_Budget WHERE month = $1', [monthStr]);
        const budget = budgetRes.rows.length > 0 ? parseFloat(budgetRes.rows[0].budget) : 0;

        const spentQuery = `
            SELECT 
                COALESCE((SELECT SUM(amount) FROM Expenses WHERE to_char(date, 'YYYY-MM') = $1), 0) +
                COALESCE((SELECT SUM(amount) FROM Maid_Payments WHERE to_char(date, 'YYYY-MM') = $1), 0) +
                COALESCE((SELECT SUM(amount_paid) FROM Recurring_Payments WHERE to_char(paid_on, 'YYYY-MM') = $1), 0) +
                COALESCE((SELECT SUM(total_amount) FROM Milk_Log WHERE to_char(date, 'YYYY-MM') = $1), 0) 
            AS total_spent
        `;
        const spentRes = await db.query(spentQuery, [monthStr]);
        const spent = parseFloat(spentRes.rows[0].total_spent);

        const calRes = await db.query(`
            SELECT id, event_type as title, date, 'Event' as type 
            FROM Calendar_Events 
            WHERE date >= $1 AND date <= $2
        `, [todayStr, nextWeekStr]);

        const schRes = await db.query('SELECT * FROM Recurring_Schedules');
        const payRes = await db.query('SELECT schedule_id, due_date FROM Recurring_Payments');
        
        let upcoming = [...calRes.rows];

        schRes.rows.forEach(sch => {
            const total = parseFloat(sch.total_amount);
            const instAmt = parseFloat(sch.installment_amount);
            const count = Math.ceil(total / instAmt);
            
            for (let i = 0; i < count; i++) {
                let d = new Date(sch.start_date);
                if(sch.interval_type === 'Weekly') d.setDate(d.getDate() + 7 * i);
                else if(sch.interval_type === 'Monthly') d.setMonth(d.getMonth() + 1 * i);
                else if(sch.interval_type === 'Quarterly') d.setMonth(d.getMonth() + 3 * i);
                else if(sch.interval_type === 'Half-Yearly') d.setMonth(d.getMonth() + 6 * i);
                else if(sch.interval_type === 'Yearly') d.setFullYear(d.getFullYear() + 1 * i);
                
                const dueDateStr = d.toISOString().split('T')[0];
                const isPaid = payRes.rows.some(p => p.schedule_id === sch.id && new Date(p.due_date).toISOString().split('T')[0] === dueDateStr);
                
                if (!isPaid && d >= new Date(todayStr) && d <= new Date(nextWeekStr)) {
                    upcoming.push({
                        id: `${sch.id}-${i}`,
                        title: sch.name,
                        date: dueDateStr,
                        type: 'Bill',
                        amount: i === count - 1 ? (total - (instAmt * i)) : instAmt
                    });
                }
            }
        });

        upcoming = upcoming.map(item => {
            const itemDate = new Date(item.date);
            const diffTime = itemDate.getTime() - new Date(todayStr).getTime();
            const days_left = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { ...item, days_left };
        }).sort((a, b) => a.days_left - b.days_left);

        res.status(200).json({ budget, spent, upcoming });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBudget = async (req, res) => {
    const { budget } = req.body;
    const monthStr = new Date().toISOString().slice(0, 7);
    try {
        await db.query(`
            INSERT INTO Monthly_Budget (month, budget) VALUES ($1, $2)
            ON CONFLICT (month) DO UPDATE SET budget = EXCLUDED.budget
        `, [monthStr, parseFloat(budget)]);
        res.status(200).json({ message: "Budget updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};