const amqp = require('amqplib');
const mysql = require('mysql2');

const RABBITMQ_URL = 'amqp://172.16.1.4';
const QUEUE_NAME = 'jokes_queue';

// Database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'joke_service',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

console.log("ETL service starting...");

// Start consuming messages
async function startConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log("ETL waiting for messages...");

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const message = JSON.parse(msg.content.toString());
                    console.log("Received message:", message);

                    const { setup, punchline, type } = message;

                    // Check if type exists
                    const [typeRows] = await db.promise().query(
                        'SELECT id FROM types WHERE name = ?',
                        [type]
                    );

                    let typeId;

                    if (typeRows.length > 0) {
                        typeId = typeRows[0].id;
                    } else {
                        const [insertTypeResult] = await db.promise().query(
                            'INSERT INTO types (name) VALUES (?)',
                            [type]
                        );
                        typeId = insertTypeResult.insertId;
                    }

                    // Insert joke
                    await db.promise().query(
                        'INSERT INTO jokes (setup, punchline, type_id) VALUES (?, ?, ?)',
                        [setup, punchline, typeId]
                    );

                    console.log("Joke inserted into database.");

                    // Acknowledge message
                    channel.ack(msg);

                } catch (error) {
                    console.error("ETL processing error:", error);
                }
            }
        });

    } catch (error) {
        console.error("RabbitMQ connection error:", error);
        setTimeout(startConsumer, 5000);
    }
}

startConsumer();
