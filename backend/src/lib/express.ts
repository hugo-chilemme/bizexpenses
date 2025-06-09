import express from 'express';
import loadRoutes from './versions';
import cors from 'cors';
import bodyParser from 'body-parser';

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

app.use((req: express.Request, res: express.Response) => {
    // log url
    console.log(`[ERROR] ${req.url}`);
    
    res.status(200).json({ status: 'error', error: 'The requested resource was not found' });
});
