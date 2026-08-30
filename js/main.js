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

// Funcionalidad de filtrado dinámico en rutas.html
const filterCheckboxes = document.querySelectorAll('.filters-sidebar input[type="checkbox"]');
const routeCards = document.querySelectorAll('.route-horizontal-card');

if (filterCheckboxes.length > 0 && routeCards.length > 0) {
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Obtenemos todos los filtros seleccionados
            const activeFilters = Array.from(filterCheckboxes)
                .filter(i => i.checked)
                .map(i => i.parentElement.textContent.trim().toLowerCase());

            // Recorremos cada tarjeta para mostrar u ocultar según coincida
            routeCards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                
                // Si la tarjeta incluye algún criterio seleccionado o no hay nada filtrado
                const isVisible = activeFilters.some(filter => cardText.includes(filter)) || activeFilters.length === 0;
                
                card.style.display = isVisible ? 'flex' : 'none';
            });
        });
    });
}
