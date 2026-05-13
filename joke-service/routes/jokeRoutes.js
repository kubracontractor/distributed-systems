

const express = require('express');
const router = express.Router();
const db = require('../db');


// GET /types
router.get('/types', (req, res) => {
    const query = "SELECT name FROM types";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL ERROR:", err);
            return res.status(500).json({ error: err.message });
        }

        const types = results.map(row => row.name);
        res.json(types);
    });
});


// GET /joke/:type?count=number
router.get('/joke/:type', (req, res) => {
    const type = req.params.type;
    const count = parseInt(req.query.count) || 1;

    let query;
    let params;

    if (type === 'any') {
        query = `
            SELECT jokes.setup, jokes.punchline, types.name AS type
            FROM jokes
            JOIN types ON jokes.type_id = types.id
            ORDER BY RAND()
            LIMIT ?
        `;
        params = [count];
    } else {
        query = `
            SELECT jokes.setup, jokes.punchline, types.name AS type
            FROM jokes
            JOIN types ON jokes.type_id = types.id
            WHERE types.name = ?
            ORDER BY RAND()
            LIMIT ?
        `;
        params = [type, count];
    }

    /*db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No jokes found' });
        }

        res.json(results);
    });*/

    db.query(query, params, (err, results) => {
    if (err) {
        console.error("SQL ERROR:", err);
        return res.status(500).json({ error: err.message });
    }

    console.log("Query Results:", results);

    if (!results || results.length === 0) {
        return res.status(404).json({ message: 'No jokes found' });
    }

    res.json(results);
    });

});

module.exports = router;