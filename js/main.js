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

// Base de datos local de rutas
const routesData = {
    amazonas: {
        title: "Río Amazonas",
        img: "Amazonas.png",
        rating: "4.95",
        price: "$500.000",
        total: "$1.500.000",
        desc: "Explora la selva tropical más extensa del mundo. Vive una aventura rodeado de naturaleza salvaje, navega por el río Amazonas y conecta con las comunidades locales en una experiencia ecológica inolvidable."
    },
    guatape: {
        title: "Ruta Natural Guatapé",
        img: "Guatape.jpg",
        rating: "4.84",
        price: "$250.000",
        total: "$750.000",
        desc: "Descubre la majestuosidad de la Piedra del Peñol a través de una ruta sostenible, disfrutando de vistas panorámicas del embalse mientras apoyas iniciativas locales que protegen el entorno natural."
    },
    nuqui: {
        title: "Isla Nuquí",
        img: "Nuqui.jpg",
        rating: "4.90",
        price: "$400.000",
        total: "$1.200.000",
        desc: "Disfruta del espectáculo natural del avistamiento de ballenas jorobadas en las aguas del Pacífico colombiano, rodeado de selva virgen, termales marinas y playas solitarias."
    },
    cocora: {
        title: "Valle del Cocora",
        img: "Cocora.jpg",
        rating: "4.88",
        price: "$180.000",
        total: "$540.000",
        desc: "Recorre el majestuoso paisaje del Eje Cafetero admirando las palmas de cera más altas del mundo. Una caminata ecológica entre montañas y bosques de niebla."
    }
};

// Cargar la información según la URL en detalle-ruta.html
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const routeId = params.get('id') || 'guatape';
    const currentRoute = routesData[routeId] || routesData['guatape'];

    const titleEl = document.getElementById('detailTitle');
    if (titleEl) {
        titleEl.textContent = currentRoute.title;
        document.getElementById('detailRating').textContent = `★ ${currentRoute.rating}`;
        document.getElementById('cardRating').textContent = currentRoute.rating;
        document.getElementById('detailPrice').textContent = currentRoute.price;
        document.getElementById('detailTotal').textContent = currentRoute.total;
        document.getElementById('detailDescText').textContent = currentRoute.desc;

        // Imágenes
        document.getElementById('imgMain').src = currentRoute.img;
        document.getElementById('imgSide1').src = currentRoute.img;
        document.getElementById('imgSide2').src = currentRoute.img;
        document.getElementById('imgSide3').src = currentRoute.img;

        // Cargar "Otros Destinos"
        const othersContainer = document.getElementById('otherDestinationsContainer');
        if (othersContainer) {
            Object.keys(routesData).forEach(key => {
                if (key !== routeId) {
                    const item = routesData[key];
                    const cardHTML = `
                        <article class="route-horizontal-card" style="width: 100%;">
                            <div class="card-image-container">
                                <img src="${item.img}" alt="${item.title}">
                            </div>
                            <div class="card-info-container">
                                <h3 class="route-title">${item.title}</h3>
                                <p class="route-desc">${item.desc.substring(0, 90)}...</p>
                                <div class="card-footer-info">
                                    <span class="route-rating">★ ${item.rating}</span>
                                    <div class="price-container">
                                        <span class="day-price"><strong>${item.price}</strong> /Por día</span>
                                    </div>
                                    <a href="detalle-ruta.html?id=${key}" class="btn-details">Ver detalle</a>
                                </div>
                            </div>
                        </article>
                    `;
                    othersContainer.innerHTML += cardHTML;
                }
            });
        }
    }
});

