
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const submitRoutes = require('./routes/submitRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/', submitRoutes);

app.listen(4000, () => {
    console.log('Submit app running on port 4000');
});