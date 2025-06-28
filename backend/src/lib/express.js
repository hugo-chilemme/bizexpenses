const express = require('express');
const loadRoutes = require('./versions');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

const PORT = process.env.PORT || 3003;


if (!process.env.DOMAIN) {
    console.error('DOMAIN is not set in the environment variables');
    process.exit(1);
}

// allow all cors
app.use(cors({
    origin: process.env.DOMAIN,
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

/*
    Actual routes
*/
loadRoutes(app, 'v1', '/api/v1');
loadRoutes(app, 'v1', '/api');

app.use((req, res) => {
    // log url
    console.log(`[ERROR] ${req.url}`);
    res.status(200).json({ status: 'error', error: 'The requested resource was not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});