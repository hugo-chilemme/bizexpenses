import { Request, Response } from 'express';

const config = {
    get: {
        isAuthenticated: true,
    }
};

type RouteHandler = (req: Request, res: Response) => Promise<void>;

interface RouteModule {
    config: typeof config;
    get: RouteHandler;
}

const routeModule: RouteModule = {
    config,
    get: async (req, res) => {
        res.json({
            message: 'Welcome to the API v1',
            version: '1.0.0',
            routes: Object.keys(require('../../lib/routes')('v1')).map(route => `${req.baseUrl}${route}`),
        });
    },
};

export default routeModule;