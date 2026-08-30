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

// Funcionalidad interactiva de filtros en la página de rutas
document.addEventListener('DOMContentLoaded', () => {
    const filterCheckboxes = document.querySelectorAll('.filters-sidebar input[type="checkbox"]');
    const routeCards = document.querySelectorAll('.route-horizontal-card');

    if (filterCheckboxes.length > 0 && routeCards.length > 0) {
        
        function filterRoutes() {
            // Obtener lista de textos seleccionados en minúscula
            const selectedFilters = Array.from(filterCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.parentElement.textContent.trim().toLowerCase());

            routeCards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();

                // Si no hay ningún filtro marcado, mostramos todas las tarjetas
                if (selectedFilters.length === 0) {
                    card.style.display = 'flex';
                    return;
                }

                // Verificar si la tarjeta coincide con al menos uno de los filtros seleccionados
                const matches = selectedFilters.some(filter => 
                    cardText.includes(filter) || cardCategory.includes(filter)
                );

                card.style.display = matches ? 'flex' : 'none';
            });
        }

        // Asignar el evento change a todas las casillas
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', filterRoutes);
        });
    }
});

