require('dotenv').config();
const app = require('./app');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect()
    .then(client => {
        console.log('Database connection established.');
        client.release();
        app.listen(PORT, () => {
            console.log(`Server operating on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err.stack);
        process.exit(1);
    });