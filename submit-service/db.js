const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'joke_service',
    port: process.env.DB_PORT || 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection once at startup
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL');
        connection.release();
    }
});

module.exports = db;






