const fs = require('fs');

/*
    context: use system nextjs
    (folder) : just for documentation (exemple: (docs)/page.js => /page)
    [userId] : dynamic route (exemple: /[userId]/page.js => /:userId/page)
    index.js : route (exemple: /page/index.js => /page)
*/

module.exports = (version) => {

    let routesList = {};

    function recursive(path, routes = {}, base = '') {
        fs.readdirSync(path).forEach(file => {
            if (fs.lstatSync(`${path}/${file}`).isDirectory()) {
                let newBase = base;
                if (!file.startsWith('(') || !file.endsWith(')')) {
                    newBase += '/' + file;
                }
                recursive(`${path}/${file}`, routes, newBase);
            } else {
                let route = file.replace('.js', '');

                // Handle index.js as root of the folder
                if (route === 'index') {
                    route = '';
                }
                let fullRoute = base + '/' + route;

                if (fullRoute.endsWith('/'))
                    fullRoute = fullRoute.slice(0, -1);

                routesList[fullRoute] = path + '/' + file;
            }
        });
    }

    recursive(`${process.cwd()}/src/versions/${version}/routes`);


    // detect [ ]
    let routesListTmp = Object.entries(routesList);
    for (let [route, path] of routesListTmp) {
        while (route.includes('[') && route.includes(']')) {
            route = route.replace('[', ':').replace(']', '');
        }
        delete routesList[route];
        routesList[route] = path;
    }

    return routesList;
}