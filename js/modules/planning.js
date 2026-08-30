import { Storage } from '../storage.js';

export class PlanningModule {
    constructor() {
        this.routesKey = 'jepira_routes';
        this.init(); // Inicializa las rutas si el localStorage está vacío
    }

    init() {
        const currentRoutes = Storage.get(this.routesKey);
        if (!currentRoutes || currentRoutes.length === 0) {
            const defaultRoutes = [
                {
                    id: 'route_amazonas',
                    corporateId: 'corp_1',
                    title: 'Amazonas Auténtico',
                    description: 'Explora la selva amazónica y sus comunidades.',
                    image: 'img/Amazonas.png',
                    price: 450000,
                    date: '2026-09-01',
                    availableSeats: 15,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'route_guatape',
                    corporateId: 'corp_1',
                    title: 'Piedra del Peñol y Guatapé',
                    description: 'Disfruta de la vista panorámica y el embalse.',
                    image: 'img/Guatape.jpg',
                    price: 180000,
                    date: '2026-09-05',
                    availableSeats: 20,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'route_nuqui',
                    corporateId: 'corp_2',
                    title: 'Isla Nuquí',
                    description: 'Avistamiento de ballenas y playas del Pacífico.',
                    image: 'img/Isla Nuqui.jpg',
                    price: 650000,
                    date: '2026-09-10',
                    availableSeats: 10,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'route_quindio',
                    corporateId: 'corp_2',
                    title: 'Valle del Cocora',
                    description: 'Recorrido por el paisaje cultural cafetero.',
                    image: 'img/quindio-3977049_1280.jpg',
                    price: 220000,
                    date: '2026-09-12',
                    availableSeats: 12,
                    createdAt: new Date().toISOString()
                }
            ];
            Storage.set(this.routesKey, defaultRoutes);
        }
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
            title: routeData.title,
            description: routeData.description,
            image: routeData.image,
            price: Number(routeData.price),
            date: routeData.date,
            availableSeats: Number(routeData.seats),
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