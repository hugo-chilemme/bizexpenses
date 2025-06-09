

module.exports = (app, versionFolder, apiRoute) => {

    try {
        require(process.cwd() + '/src/versions/' + versionFolder + '/routers.ts')(app, apiRoute);
    } catch (error) {
        console.error(`Cannot load routes for version ${versionFolder}`, error);
    }

}