const express = require('express');
const loadRoutes = require('./versions');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// allow all cors
app.use(cors());
app.use(bodyParser.json());

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