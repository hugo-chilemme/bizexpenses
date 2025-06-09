import { Application, Request, Response, NextFunction } from 'express';
import scanRoutes from '../../lib/routes';

type EndpointHandler = (req: Request, res: Response) => any;
type RouteConfig = Record<string, any>;
type RouterModule = {
    config: RouteConfig;
} & {
    [method in 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head']?: EndpointHandler;
};

export default function registerRouters(app: Application, api: string): void {
    require('./index');

    const isDefault = api === '/api';

    console.info(`v1 routes loaded on ${api} ${isDefault && '(default)'}`);

    app.get(`${api}/status`, (req: Request, res: Response) => {
        res.json({
            message: 'Welcome to the API v1',
            version: '1.0.0',
            routes: Object.keys(scanRoutes('v1')).map(route => `${api}${route}`),
        });
    });


    const allRoutes = Object.fromEntries(
        Object.entries(scanRoutes('v1')).sort(([pathA,], [pathB,]) => {
            const countA = (pathA.match(/:/g) || []).length + (pathA.match(/\[/g) || []).length;
            const countB = (pathB.match(/:/g) || []).length + (pathB.match(/\[/g) || []).length;
            return countA - countB;
        })
    );

    console.log(`v1 routes found: ${Object.keys(allRoutes).length}`);
    for (const [route, path] of Object.entries(allRoutes) as [string, string][]) {
        const router: RouterModule = require(path).default || require(path);
        const configs = router.config || {};
        for (const method of Object.keys(configs)) {
            registerRoute(app, method, api + route, router[method as keyof RouterModule] as EndpointHandler, configs[method]);
        }
    }
}

function registerRoute(
    app: Application,
    method: string,
    route: string,
    endpoint: EndpointHandler,
    config: any
): void {
    (app as any)[method as keyof Application](route, async (req: Request, res: Response) => {

        return endpoint(req, res);
    });
    console.log(`${method.toUpperCase()} — ${route} [http://localhost:10001${route}]`);
}