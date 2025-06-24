const fs = require('fs');
const scanRoutes = require('@/lib/routes');
const database = require('./utils/database');
const jwt = require('jsonwebtoken');

const { ObjectId } = require('mongodb');

module.exports = (app, api) => {

    require('./index');


    const isDefault = api === '/api';

    console.info(`v1 routes loaded on ${api} ${isDefault && '(default)'}`);


    const allRoutes = Object.fromEntries(
        Object.entries(scanRoutes('v1')).sort(([pathA,], [pathB,]) => {

            const countA = (pathA.match(/:/g) || []).length + (pathA.match(/\[/g) || []).length;
            const countB = (pathB.match(/:/g) || []).length + (pathB.match(/\[/g) || []).length;

            return countA - countB; // Sort paths with fewer ":" first
        })
    );


    

    for (const [route, path] of Object.entries(allRoutes)) 
    {

        const router = require(path);

        const configs = router.config || {};

        for (const method of Object.keys(configs))
        {

            registerRoute(app, method, api + route, router[method], configs[method]);

        }

    }
}

function registerRoute(app, method, route, endpoint, config)
{

    if (config.isAuthentified)
    {
        app[method](route, jwtAuth, async (req, res, next) => {
            console.info(`Route ${route} is authenticated, using JWT authentication.`);
            return endpoint(req, res);
        });
    }
    else 
    {
        app[method](route, async (req, res, next) => {
            console.warn(`Route ${route} is not authenticated, this is not recommended.`);
            return endpoint(req, res);
        });
    }

    console.log(`${method.toUpperCase()} — ${route}`);
}


/**
 * Middleware to authenticate requests using JWT.
 *
 * Extracts the JWT token from the 'Authorization' header, verifies it using the secret key,
 * and attaches the decoded user information to the request object. If the token is missing
 * or invalid, responds with a 401 Unauthorized error.
 *
 * @async
 * @function jwtAuth
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 */
async function jwtAuth(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const {uuid } = decoded;

        const user = await database().collection('users').findOne({ uuid: uuid });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = {...user, password: undefined}; 

        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
}