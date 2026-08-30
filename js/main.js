import { UsersModule } from './modules/users.js';
import { PlanningModule } from './modules/planning.js';
import { ReservationsModule } from './modules/reservations.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar módulos base
    const usersApp = new UsersModule();
    const planningApp = new PlanningModule();
    const reservationsApp = new ReservationsModule();

    console.log('Sistema Jepira cargado correctamente con todos sus módulos.');

    // 2. Manejo del formulario de búsqueda en la página de inicio (index.html)
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            const searchData = {
                location: document.getElementById('location').value,
                date: document.getElementById('date').value,
                package: document.getElementById('packages').value,
                guests: document.getElementById('guests').value
            };

            localStorage.setItem('jepira_search', JSON.stringify(searchData));
        });
    }

    // 3. Aplicar los filtros guardados en la página de rutas (rutas.html)
    const routeCardsContainer = document.querySelector('.route-cards');
    const savedSearch = localStorage.getItem('jepira_search');

    if (savedSearch && routeCardsContainer) {
        const filters = JSON.parse(savedSearch);
        console.log("Filtros de búsqueda recibidos:", filters);

        // Limpiar la búsqueda de la memoria tras leerla
        localStorage.removeItem('jepira_search');
    }
});
