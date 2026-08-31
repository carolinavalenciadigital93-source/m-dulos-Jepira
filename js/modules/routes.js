// js/modules/routes.js

export class RoutesModule {
    constructor() {
        this.storageKey = 'jepira_routes';
    }

    /**
     * Obtiene todas las rutas almacenadas en LocalStorage
     * @returns {Array} Lista de rutas
     */
    getRoutes() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    /**
     * Obtiene las rutas creadas por una empresa específica
     * @param {string} companyId - ID de la empresa
     * @returns {Array} Lista de rutas de la empresa
     */
    getRoutesByCompany(companyId) {
        const routes = this.getRoutes();
        return routes.filter(route => route.companyId === companyId);
    }

    /**
     * Guarda una nueva ruta en LocalStorage
     * @param {Object} routeData - Datos del formulario de la ruta
     * @returns {Object} La nueva ruta creada con ID y metadata
     */
    saveRoute(routeData) {
        const routes = this.getRoutes();
        const currentUser = JSON.parse(localStorage.getItem('jepira_current_user'));

        const newRoute = {
            id: 'rut_' + Date.now(),
            companyId: currentUser?.id || 'emp_01',
            companyName: currentUser?.name || 'Ecotours Wayúu & Co.',
            title: routeData.title || '',
            description: routeData.description || '',
            location: routeData.location || '',
            price: Number(routeData.price) || 0,
            capacity: Number(routeData.capacity) || 0,
            category: routeData.category || 'Eco-turismo',
            status: 'activa',
            createdAt: new Date().toISOString()
        };

        routes.push(newRoute);
        localStorage.setItem(this.storageKey, JSON.stringify(routes));
        return newRoute;
    }

    /**
     * Alias de saveRoute para mantener compatibilidad
     */
    addRoute(routeData) {
        return this.saveRoute(routeData);
    }

    /**
     * Elimina una ruta por su ID
     * @param {string} routeId - ID de la ruta a eliminar
     * @returns {boolean} Status de la operación
     */
    deleteRoute(routeId) {
        let routes = this.getRoutes();
        const initialLength = routes.length;
        routes = routes.filter(route => route.id !== routeId);
        
        if (routes.length !== initialLength) {
            localStorage.setItem(this.storageKey, JSON.stringify(routes));
            return true;
        }
        return false;
    }
}
