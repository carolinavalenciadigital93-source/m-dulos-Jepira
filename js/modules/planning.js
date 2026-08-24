import { Storage } from '../storage.js';

export class PlanningModule {
    constructor() {
        this.routesKey = 'jepira_routes';
    }

    // 1. Obtener todas las rutas (catálogo público)
    getAllRoutes() {
        return Storage.get(this.routesKey);
    }

    // 2. Obtener rutas creadas por una empresa específica
    getRoutesByCorporate(corporateId) {
        const routes = this.getAllRoutes();
        return routes.filter(route => route.corporateId === corporateId);
    }

    // 3. Crear una nueva ruta (Solo Pymes/Empresas)
    createRoute(corporateId, routeData) {
        const routes = this.getAllRoutes();

        const newRoute = {
            id: 'route_' + Date.now(),
            corporateId: corporateId,
            title: routeData.title,               // Nombre de la ruta
            description: routeData.description,   // Descripción
            image: routeData.image,               // URL o Base64
            price: Number(routeData.price),       // Precio
            date: routeData.date,                 // Fecha
            availableSeats: Number(routeData.seats), // Cupos
            createdAt: new Date().toISOString()
        };

        routes.push(newRoute);
        Storage.set(this.routesKey, routes);
        return { success: true, message: 'Ruta creada exitosamente.', route: newRoute };
    }

    // 4. Eliminar / Quitar una ruta
    deleteRoute(routeId, corporateId) {
        let routes = this.getAllRoutes();
        const initialLength = routes.length;

        routes = routes.filter(r => !(r.id === routeId && r.corporateId === corporateId));

        if (routes.length === initialLength) {
            return { success: false, message: 'No se encontró la ruta o no tienes permisos.' };
        }

        Storage.set(this.routesKey, routes);
        return { success: true, message: 'Ruta eliminada correctamente.' };
    }
}