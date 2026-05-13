const express = require('express');
const cors = require('cors');
const jokeRoutes = require('./routes/jokeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Use joke routes
app.use('/', jokeRoutes);

app.listen(3000, () => {
    console.log('Joke app running on port 3000');
});

