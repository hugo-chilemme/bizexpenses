import { Express } from 'express';



export default function LoadVersion(
    app: Express,
    versionFolder: string,
    apiRoute: string
): void {
    try {
        import(process.cwd() + '/src/versions/' + versionFolder + '/routers.ts')
            .then((module) => {
            if (typeof module.default === 'function') {
                module.default(app, apiRoute);
            } else {
                throw new Error('Router module does not export a default function');
            }
            });
    } catch (error) {
        console.error(`Cannot load routes for version ${versionFolder}`, error);
    }
}