import { UsersModule } from './Modules/users.js';
import { PlanningModule } from './Modules/planning.js';
import { ReservationsModule } from './Modules/reservations.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar módulos
  const usersApp = new UsersModule();
  const planningApp = new PlanningModule();
  const reservationsApp = new ReservationsModule();

  console.log('Sistema Jepira cargado correctamente con todos sus módulos.');

  // ==========================================
  // CONEXIÓN: REGISTRO DE USUARIOS
  // ==========================================
  const formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
      e.preventDefault();

      const userData = {
        role: document.getElementById('reg-tipo').value,
        name: document.getElementById('reg-nombre').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-telefono').value,
        password: document.getElementById('reg-password').value
      };

      const response = usersApp.registerUser(userData);
      const contenedorMensaje = document.getElementById('mensaje-registro');

      if (response.success) {
        contenedorMensaje.style.color = '#2e7d32';
        contenedorMensaje.textContent = response.message + ' Redirigiendo al login...';
        formRegistro.reset();

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } else {
        contenedorMensaje.style.color = '#d32f2f';
        contenedorMensaje.textContent = response.message;
      }
    });
  }

  // ==========================================
  // CONEXIÓN: INICIO DE SESIÓN (LOGIN)
  // ==========================================
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const role = document.getElementById('login-tipo') ? document.getElementById('login-tipo').value : null;

      const response = usersApp.login(email, password, role);
      const contenedorMensaje = document.getElementById('mensaje-login');

      if (response.success) {
        contenedorMensaje.style.color = '#2e7d32';
        contenedorMensaje.textContent = '¡Bienvenido! Redirigiendo...';

        setTimeout(() => {
          if (response.user.role === 'corporate') {
            window.location.href = 'panel-empresa.html';
          } else {
            window.location.href = 'mis-reservas.html';
          }
        }, 1000);
      } else {
        contenedorMensaje.style.color = '#d32f2f';
        contenedorMensaje.textContent = response.message;
      }
    });
  }

  // ==========================================
  // CONEXIÓN: FILTRADO Y BÚSQUEDA DE RUTAS (rutas.html)
  // ==========================================
  const routeCards = document.querySelectorAll('.route-horizontal-card');
  const searchInput = document.getElementById('routeSearchInput');
  const filterCheckboxes = document.querySelectorAll('.filters-sidebar input[type="checkbox"]');
  const resultsCountSpan = document.getElementById('resultsCount');

  if (routeCards.length > 0) {
    const applyFilters = () => {
      const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
      let visibleCount = 0;

      // Obtener opciones seleccionadas por categoría
      const selectedFilters = {
        hospedaje: Array.from(document.querySelectorAll('input[data-filter-type="hospedaje"]:checked')).map(cb => cb.value),
        precio: Array.from(document.querySelectorAll('input[data-filter-type="precio"]:checked')).map(cb => cb.value),
        habitaciones: Array.from(document.querySelectorAll('input[data-filter-type="habitaciones"]:checked')).map(cb => cb.value),
        actividad: Array.from(document.querySelectorAll('input[data-filter-type="actividad"]:checked')).map(cb => cb.value)
      };

      routeCards.forEach(card => {
        const cardTitle = card.querySelector('.route-title')?.textContent.toLowerCase() || '';
        const cardDesc = card.querySelector('.route-desc')?.textContent.toLowerCase() || '';
        const cardHospedaje = card.getAttribute('data-hospedaje') || '';
        const cardPrecio = parseFloat(card.getAttribute('data-precio')) || 0;
        const cardHabitaciones = card.getAttribute('data-habitaciones') || '';
        const cardActividades = (card.getAttribute('data-actividad') || '').split(' ');

        // 1. Coincidencia por texto
        const matchesSearch = cardTitle.includes(searchTerm) || cardDesc.includes(searchTerm);

        // 2. Coincidencia por Hospedaje
        const matchesHospedaje = selectedFilters.hospedaje.length === 0 || selectedFilters.hospedaje.includes(cardHospedaje);

        // 3. Coincidencia por Habitaciones
        const matchesHabitaciones = selectedFilters.habitaciones.length === 0 || selectedFilters.habitaciones.includes(cardHabitaciones);

        // 4. Coincidencia por Actividad
        const matchesActividad = selectedFilters.actividad.length === 0 || selectedFilters.actividad.some(act => cardActividades.includes(act));

        // 5. Coincidencia por Precio
        let matchesPrecio = selectedFilters.precio.length === 0;
        if (!matchesPrecio) {
          matchesPrecio = selectedFilters.precio.some(range => {
            if (range === '120') return cardPrecio <= 120000;
            if (range === '100-300') return cardPrecio >= 100000 && cardPrecio <= 300000;
            if (range === '300-500') return cardPrecio > 300000 && cardPrecio <= 500000;
            return true;
          });
        }

        // Determinar si la tarjeta cumple todas las condiciones
        if (matchesSearch && matchesHospedaje && matchesHabitaciones && matchesActividad && matchesPrecio) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Actualizar contador visual
      if (resultsCountSpan) {
        resultsCountSpan.textContent = visibleCount;
      }
    };

    // Listeners para filtros y buscador
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', applyFilters);
    });
  }

  // ==========================================
  // CONEXIÓN: CARGAR DETALLE DE LA RUTA Y OTROS DESTINOS (detalle-ruta.html)
  // ==========================================
  const detailTitle = document.getElementById('detailTitle') || document.getElementById('ruta-titulo');

  if (detailTitle) {
    const params = new URLSearchParams(window.location.search);
    const routeId = params.get('id');
    const routes = planningApp.getAllRoutes() || [];

    // Buscar ruta por ID exacto, parcial o tomar la primera por defecto
    let currentRoute = routes.find(r => r.id === routeId);

    if (!currentRoute && routeId) {
      currentRoute = routes.find(r => r.id.includes(routeId) || routeId.includes(r.id.replace('route_', '')));
    }

    if (!currentRoute && routes.length > 0) {
      currentRoute = routes[0];
    }

    if (currentRoute) {
      // 1. Título
      detailTitle.textContent = currentRoute.title;

      // 2. Descripción
      const detailDesc = document.getElementById('detailDescText') || document.getElementById('ruta-descripcion');
      if (detailDesc) detailDesc.textContent = currentRoute.description;

      // 3. Imagen Principal
      const imgPrincipal = document.getElementById('imgPrincipal');
      if (imgPrincipal) imgPrincipal.src = currentRoute.image;

      // 4. Renderizar "Otros Destinos"
      const otherContainer = document.getElementById('otherDestinationsContainer');
      if (otherContainer) {
        const otherRoutes = routes.filter(r => r.id !== currentRoute.id);
        otherContainer.innerHTML = '';

        otherRoutes.forEach(route => {
          const cardHTML = `
            <div class="destination-card">
              <img src="${route.image}" alt="${route.title}">
              <div class="destination-info">
                <h4>${route.title}</h4>
                <p>${route.description ? route.description.substring(0, 80) + '...' : ''}</p>
                <a href="detalle-ruta.html?id=${route.id}" class="btn-secondary">Ver detalles</a>
              </div>
            </div>
          `;
          otherContainer.innerHTML += cardHTML;
        });
      }
    }
  }
});