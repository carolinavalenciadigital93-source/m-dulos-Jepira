import { UsersModule } from './modules/users.js';
import { PlanningModule } from './modules/planning.js';
import { ReservationsModule } from './modules/reservations.js';

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
        role: document.getElementById('reg-tipo') ? document.getElementById('reg-tipo').value : 'explorer',
        name: document.getElementById('reg-nombre').value,
        document: document.getElementById('reg-documento') ? document.getElementById('reg-documento').value : '', // <-- Captura de Cédula/NIT
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

        const matchesSearch = cardTitle.includes(searchTerm) || cardDesc.includes(searchTerm);
        const matchesHospedaje = selectedFilters.hospedaje.length === 0 || selectedFilters.hospedaje.includes(cardHospedaje);
        const matchesHabitaciones = selectedFilters.habitaciones.length === 0 || selectedFilters.habitaciones.includes(cardHabitaciones);
        const matchesActividad = selectedFilters.actividad.length === 0 || selectedFilters.actividad.some(act => cardActividades.includes(act));

        let matchesPrecio = selectedFilters.precio.length === 0;
        if (!matchesPrecio) {
          matchesPrecio = selectedFilters.precio.some(range => {
            if (range === '120') return cardPrecio <= 120000;
            if (range === '100-300') return cardPrecio >= 100000 && cardPrecio <= 300000;
            if (range === '300-500') return cardPrecio > 300000 && cardPrecio <= 500000;
            return true;
          });
        }

        if (matchesSearch && matchesHospedaje && matchesHabitaciones && matchesActividad && matchesPrecio) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (resultsCountSpan) {
        resultsCountSpan.textContent = visibleCount;
      }
    };

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

    let currentRoute = null;

    if (routeId) {
      const cleanSearch = routeId.replace('route_', '').toLowerCase();
      // Búsqueda inteligente por ID exacto, fragmento de ID o título
      currentRoute = routes.find(r => 
        r.id === routeId || 
        r.id.toLowerCase().includes(cleanSearch) ||
        r.title.toLowerCase().includes(cleanSearch)
      );
    }

    // Si no coincide la búsqueda o no viene ID, toma la primera como respaldo
    if (!currentRoute && routes.length > 0) {
      currentRoute = routes[0];
    }

    if (currentRoute) {
      // 1. Actualizar título y descripción
      detailTitle.textContent = currentRoute.title;

      const allParagraphs = document.querySelectorAll('main p');
      allParagraphs.forEach(p => {
        if (p.textContent.includes('Selecciona un destino') || p.id === 'detailDescText' || p.id === 'ruta-descripcion') {
          p.textContent = currentRoute.description;
        }
      });

      // 2. Actualizar imágenes superiores (Galería específica del destino)
      const galleryGrid = document.querySelector('.gallery-grid');
      if (galleryGrid) {
        const galleryImgs = galleryGrid.querySelectorAll('img');
        
        if (currentRoute.images && currentRoute.images.length > 0) {
          galleryImgs.forEach((img, index) => {
            const imgSrc = currentRoute.images[index] || currentRoute.images[0] || currentRoute.image;
            if (imgSrc) {
              img.src = imgSrc;
              img.alt = currentRoute.title;
            }
          });
        } else if (currentRoute.image) {
          galleryImgs.forEach(img => {
            img.src = currentRoute.image;
            img.alt = currentRoute.title;
          });
        }
      }

      // 3. Actualizar precio
      const priceElement = document.querySelector('.price-container strong, .price-tag, .price-big, main .price');
      if (priceElement && currentRoute.price) {
        priceElement.textContent = `$${currentRoute.price.toLocaleString('es-CO')}`;
      }

      // 4. Renderizar Otros Destinos (Ruta dinámica)
      const otherContainer = document.getElementById('otherDestinationsContainer');
      if (otherContainer) {
        const otherRoutes = routes.filter(r => r.id !== currentRoute.id);
        otherContainer.innerHTML = '';

        const currentPath = window.location.pathname.split('/').pop();

        otherRoutes.forEach(route => {
          const imageSrc = route.image || (route.images ? route.images[0] : 'img/default.jpg');
          const descriptionSnippet = route.description ? route.description.substring(0, 90) + '...' : 'Descubre este increíble destino.';

          const cardHTML = `
            <div class="destination-card">
              <img src="${imageSrc}" alt="${route.title}">
              <div class="destination-info">
                <h4>${route.title}</h4>
                <p>${descriptionSnippet}</p>
                <a href="${currentPath}?id=${route.id}" class="btn-secondary">Ver detalles</a>
              </div>
            </div>
          `;
          otherContainer.innerHTML += cardHTML;
        });
      }
    }
  }

  // ==========================================
  // CONEXIÓN: MIS RESERVAS (mis-reservas.html)
  // ==========================================
  const containerReservas = document.getElementById('contenedor-reservas');

  if (containerReservas) {
    const currentUser = JSON.parse(localStorage.getItem('jepira_current_user'));

    if (!currentUser) {
      containerReservas.innerHTML = `<p style="text-align:center; color:#666; padding: 40px 0;">Debes iniciar sesión para ver tus reservas.</p>`;
    } else {
      const userReservations = reservationsApp.getReservationsByUser(currentUser.id);

      if (userReservations.length === 0) {
        containerReservas.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <p style="color: #666; font-size: 1rem; margin-bottom: 15px;">Aún no tienes reservas activas.</p>
            <a href="rutas.html" class="btn-primary" style="display: inline-block;">Ver Rutas Disponibles</a>
          </div>
        `;
      } else {
        containerReservas.innerHTML = userReservations.map(res => {
          const fechaFormat = new Date(res.bookingDate || res.createdAt).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          const precioTotal = new Intl.NumberFormat('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            maximumFractionDigits: 0 
          }).format(res.totalPrice || 0);

          return `
            <div class="reservation-card" id="card-${res.id}">
              <div>
                <div class="res-title">${res.routeTitle || 'Reserva de Ruta'}</div>
                <div class="res-details">
                  <strong>Fecha de reserva:</strong> ${fechaFormat}<br>
                  <strong>Cupos reservados:</strong> ${res.seatsBooked || 1}<br>
                  <strong>Total:</strong> ${precioTotal}
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                <span class="badge-confirmed">Confirmada</span>
                <button data-id="${res.id}" class="btn-cancelar-reserva" style="padding: 6px 12px; font-size: 0.8rem; cursor: pointer; background: #d32f2f; color: #fff; border: none; border-radius: 4px;">
                  Cancelar Reserva
                </button>
              </div>
            </div>
          `;
        }).join('');

        document.querySelectorAll('.btn-cancelar-reserva').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const resId = e.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
              reservationsApp.cancelReservation(resId);
              location.reload();
            }
          });
        });
      }
    }
  }
});
