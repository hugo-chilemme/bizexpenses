const scanRoutes = require('@/lib/routes');
const database = require('./utils/database');
const { ObjectId } = require('mongodb');

module.exports = (app, api) => {

    require('./index');


    const isDefault = api === '/api';

    console.info(`v1 routes loaded on ${api} ${isDefault && '(default)'}`);



    app.get(api + '/status', (req, res) => {

        return res.send({ status: 'success', version: 'v1', root: isDefault, maintenance: false});
    });


    const allRoutes = Object.fromEntries(
        Object.entries(scanRoutes('v1')).sort(([pathA,], [pathB,]) => {

            const countA = (pathA.match(/:/g) || []).length + (pathA.match(/\[/g) || []).length;
            const countB = (pathB.match(/:/g) || []).length + (pathB.match(/\[/g) || []).length;

            return countA - countB; // Sort paths with fewer ":" first
        })
    );


    

    for (const [route, path] of Object.entries(allRoutes) as [string, string][]) 
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


    app[method](route, async (req, res, next) => {

        
        console.log(route);
        if (!req.route.path.includes(':projectId') && !req.route.path.includes(':formId')) {
            return endpoint(req, res);
        }

        const { projectId, formId } = req.params;

        if (!ObjectId.isValid(projectId) || !ObjectId.isValid(formId)) {
            return res.status(400).json({ status: 'error', error: 'Invalid projectId or formId' });
        }

        const form = await database().collection('forms').findOne({ 
            _id: new ObjectId(formId), 
            project_id: new ObjectId(projectId) 
        });

        if (!form) {
            return res.status(404).json({ status: 'error', error: 'Form not found' });
        }


        const project = await database().collection('projects').findOne({ _id: new ObjectId(projectId) });

        req.form = form;
        req.project = project;

        return endpoint(req, res);
        


    });

    console.log(`${method.toUpperCase()} — ${route}`);
}