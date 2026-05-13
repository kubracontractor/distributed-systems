

const express = require('express');
const router = express.Router();
const db = require('../db');
const amqp = require('amqplib');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CACHE_FILE = path.join(__dirname, '../cache/types.json');

const RABBITMQ_URL = 'amqp://rabbitmq';
const QUEUE_NAME = 'jokes_queue';



/**
 * @swagger
 * /submit:
 *   post:
 *     summary: Submit a new joke
 *     description: Adds a new joke to the database
 *     tags:
 *       - Submit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - setup
 *               - punchline
 *               - type
 *             properties:
 *               setup:
 *                 type: string
 *               punchline:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joke submitted successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */


// POST /submit
/*router.post('/submit', (req, res) => {
    const { setup, punchline, type } = req.body;

    if (!setup || !punchline || !type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // First get type_id
    const getTypeQuery = 'SELECT id FROM types WHERE name = ?';

    db.query(getTypeQuery, [type], (err, typeResults) => {
        if (err) return res.status(500).json({ error: err });

        if (typeResults.length === 0) {
            return res.status(400).json({ message: 'Type does not exist (Low 3rd level)' });
        }

        const typeId = typeResults[0].id;

        const insertJokeQuery = `
            INSERT INTO jokes (setup, punchline, type_id)
            VALUES (?, ?, ?)
        `;

        db.query(insertJokeQuery, [setup, punchline, typeId], (err) => {
            if (err) return res.status(500).json({ error: err });

            res.json({ message: 'Joke submitted successfully' });
        });
    });
});*/

/*router.post('/submit', (req, res) => {
    const { setup, punchline, type } = req.body;

    if (!setup || !punchline || !type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if type exists
    const checkTypeQuery = 'SELECT id FROM types WHERE name = ?';

    db.query(checkTypeQuery, [type], (err, results) => {
        if (err) {
            console.error("SQL ERROR:", err);
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            // Type exists
            insertJoke(results[0].id);
        } else {
            // Type does not exist → create it
            const insertTypeQuery = 'INSERT INTO types (name) VALUES (?)';

            db.query(insertTypeQuery, [type], (err, typeResult) => {
                if (err) {
                    console.error("SQL ERROR:", err);
                    return res.status(500).json({ error: err.message });
                }

                insertJoke(typeResult.insertId);
            });
        }
    });

    function insertJoke(typeId) {
        const insertJokeQuery = `
            INSERT INTO jokes (setup, punchline, type_id)
            VALUES (?, ?, ?)
        `;

        db.query(insertJokeQuery, [setup, punchline, typeId], (err) => {
            if (err) {
                console.error("SQL ERROR:", err);
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Joke submitted successfully' });
        });
    }
});*/

// GET /types (with cache fallback)
router.get('/types', async (req, res) => {
    try {
        // Try to fetch from joke microservice
        const response = await axios.get('http://172.16.0.4:3000/types');
        const types = response.data;

        // Save to cache file
        fs.writeFileSync(CACHE_FILE, JSON.stringify(types, null, 2));

        console.log("Types fetched from joke service and cached.");
        res.json(types);

    } catch (error) {
        console.log("Joke service unavailable. Reading from cache.");

        if (fs.existsSync(CACHE_FILE)) {
            const cachedData = fs.readFileSync(CACHE_FILE);
            const types = JSON.parse(cachedData);
            res.json(types);
        } else {
            res.status(500).json({ message: 'No types available (no cache found)' });
        }
    }
});




router.post('/submit', async (req, res) => {
    const { setup, punchline, type } = req.body;

    if (!setup || !punchline || !type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });

        const message = {
            setup,
            punchline,
            type
        };

        channel.sendToQueue(
            QUEUE_NAME,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );

        console.log("Message sent to queue:", message);

        await channel.close();
        await connection.close();

        res.json({ message: 'Joke submitted to queue successfully' });

    } catch (error) {
        console.error("RabbitMQ Error:", error);
        res.status(500).json({ error: 'Failed to send message to queue' });
    }
});



module.exports = router;
