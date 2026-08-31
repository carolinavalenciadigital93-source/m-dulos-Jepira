// js/modules/routes.js
export class RoutesModule {
    constructor() {
        this.storageKey = 'jepira_routes';
    }

    getRoutes() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    saveRoute(routeData) {
        const routes = this.getRoutes();
        const newRoute = {
            id: 'rut_' + Date.now(),
            companyId: JSON.parse(localStorage.getItem('jepira_current_user'))?.id || 'emp_01',
            ...routeData,
            status: 'activa',
            createdAt: new Date().toISOString()
        };
        routes.push(newRoute);
        localStorage.setItem(this.storageKey, JSON.stringify(routes));
        return newRoute;
    }
}
