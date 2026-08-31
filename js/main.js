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
  // ESTADO DE SESIÓN GLOBAL Y NAVEGACIÓN (LOGOUT)
  // ==========================================
  const currentUser = JSON.parse(localStorage.getItem('jepira_current_user'));
  const userIconLink = document.querySelector('.header-icons .icon.user');

  if (currentUser && userIconLink) {
    userIconLink.title = `Hola, ${currentUser.name} (Cerrar Sesión)`;
    userIconLink.style.display = 'inline-flex';
    userIconLink.style.alignItems = 'center';

    // Manejo de clic en el icono de usuario para cerrar sesión
    userIconLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm(`¿Deseas cerrar la sesión de ${currentUser.name}?`)) {
        localStorage.removeItem('jepira_current_user');
        window.location.href = 'index.html';
      }
    });
  }

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
        document: document.getElementById('reg-documento') ? document.getElementById('reg-documento').value : '',
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-telefono').value,
        password: document.getElementById('reg-password').value
      };

      const response = usersApp.registerUser(userData);
      const contenedorMensaje = document.getElementById('mensaje-registro');

      if (response.success) {
        if (contenedorMensaje) {
          contenedorMensaje.style.color = '#2e7d32';
          contenedorMensaje.textContent = response.message + ' Redirigiendo al login...';
        }
        formRegistro.reset();

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } else {
        if (contenedorMensaje) {
          contenedorMensaje.style.color = '#d32f2f';
          contenedorMensaje.textContent = response.message;
        }
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
        // Guardar sesión activa
        localStorage.setItem('jepira_current_user', JSON.stringify(response.user));

        if (contenedorMensaje) {
          contenedorMensaje.style.color = '#2e7d32';
          contenedorMensaje.textContent = '¡Bienvenido! Redirigiendo...';
        }

        setTimeout(() => {
          if (response.user.role === 'corporate') {
            window.location.href = 'panel-empresa.html';
          } else {
            window.location.href = 'mis-reservas.html';
          }
        }, 1000);
      } else {
        if (contenedorMensaje) {
          contenedorMensaje.style.color = '#d32f2f';
          contenedorMensaje.textContent = response.message;
        }
      }
    });
  }

  // ==========================================
  // CONEXIÓN: EDICIÓN Y GUARDADO DE PERFIL
  // ==========================================
  const btnEditarPerfil = document.getElementById('btn-editar-perfil');
  const formPerfil = document.getElementById('form-perfil');

  if (btnEditarPerfil || formPerfil) {
    // Si tienes un botón que habilita la edición
    if (btnEditarPerfil) {
      btnEditarPerfil.addEventListener('click', () => {
        const inputTelefono = document.getElementById('perfil-telefono');
        const btnGuardar = document.getElementById('btn-guardar-perfil');
        if (inputTelefono) inputTelefono.removeAttribute('disabled');
        if (btnGuardar) btnGuardar.style.display = 'inline-block';
      });
    }

    // Si guardas mediante un formulario de perfil
    if (formPerfil) {
      formPerfil.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevoTelefono = document.getElementById('perfil-telefono') ? document.getElementById('perfil-telefono').value : '';
        const nuevoNombre = document.getElementById('perfil-nombre') ? document.getElementById('perfil-nombre').value : currentUser?.name;

        const result = usersApp.updateProfile({
          name: nuevoNombre,
          phone: nuevoTelefono
        });

        const mensajePerfil = document.getElementById('mensaje-perfil');
        if (result.success) {
          if (mensajePerfil) {
            mensajePerfil.style.color = '#2e7d32';
            mensajePerfil.textContent = result.message;
          } else {
            alert('¡Perfil actualizado con éxito!');
          }
        } else {
          if (mensajePerfil) {
            mensajePerfil.style.color = '#d32f2f';
            mensajePerfil.textContent = result.message;
          }
        }
      });
    }
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
  // CONEXIÓN: DETALLE DE RUTA Y FORMULARIO DE RESERVA (detalle_ruta.html)
  // ==========================================
  const detailTitle = document.getElementById('detailTitle') || document.getElementById('ruta-titulo');

  if (detailTitle) {
    const params = new URLSearchParams(window.location.search);
    const routeId = params.get('id');
    const routes = planningApp.getAllRoutes() || [];

    let currentRoute = null;

    if (routeId) {
      const cleanSearch = routeId.replace('route_', '').toLowerCase();
      currentRoute = routes.find(r => 
        r.id === routeId || 
        r.id.toLowerCase().includes(cleanSearch) ||
        r.title.toLowerCase().includes(cleanSearch)
      );
    }

    if (!currentRoute && routes.length > 0) {
      currentRoute = routes[0];
    }

    if (currentRoute) {
      // Vinculación en hidden input
      const hiddenRouteInput = document.getElementById('booking-route-id');
      if (hiddenRouteInput) hiddenRouteInput.value = currentRoute.id;

      // Actualizar Título y Descripción
      detailTitle.textContent = currentRoute.title;
      const descElement = document.getElementById('detailDescText') || document.getElementById('ruta-descripcion');
      if (descElement) descElement.textContent = currentRoute.description;

      // Actualizar Precio Unitario Visual
      const detailPriceElement = document.getElementById('detailPrice');
      if (detailPriceElement && currentRoute.price) {
        detailPriceElement.textContent = `$${currentRoute.price.toLocaleString('es-CO')}`;
      }

      // Actualizar Galería de Imágenes
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

      // Dinámica de Cálculo en la tarjeta flotante
      const seatsSelect = document.getElementById('booking-seats');
      const breakdownLabel = document.getElementById('breakdownLabel');
      const breakdownSubtotal = document.getElementById('breakdownSubtotal');
      const detailTotal = document.getElementById('detailTotal');

      const updateCalculatedPrice = () => {
        const seats = seatsSelect ? parseInt(seatsSelect.value, 10) : 1;
        const total = (currentRoute.price || 0) * seats;
        const totalFormatted = `$${total.toLocaleString('es-CO')}`;

        if (breakdownLabel) breakdownLabel.textContent = `$${(currentRoute.price || 0).toLocaleString('es-CO')} x ${seats} persona(s)`;
        if (breakdownSubtotal) breakdownSubtotal.textContent = totalFormatted;
        if (detailTotal) detailTotal.textContent = totalFormatted;
      };

      if (seatsSelect) {
        seatsSelect.addEventListener('change', updateCalculatedPrice);
        updateCalculatedPrice(); // Ejecutar al cargar
      }

      // Renderizar Otros Destinos
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

    // --- ESCUCHA DEL FORMULARIO DE RESERVA ---
    const formReservar = document.getElementById('form-reservar-ruta');
    if (formReservar) {
      formReservar.addEventListener('submit', (e) => {
        e.preventDefault();

        const activeUser = JSON.parse(localStorage.getItem('jepira_current_user'));
        const contenedorMensaje = document.getElementById('mensaje-reserva');

        if (!activeUser) {
          if (contenedorMensaje) {
            contenedorMensaje.style.color = '#d32f2f';
            contenedorMensaje.textContent = 'Debes iniciar sesión para realizar una reserva.';
          }
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
          return;
        }

        const dateInput = document.getElementById('booking-date');
        const seatsInput = document.getElementById('booking-seats');

        const bookingData = {
          userId: activeUser.id,
          userName: activeUser.name,
          userDocument: activeUser.document || 'N/A',
          routeId: currentRoute ? currentRoute.id : document.getElementById('booking-route-id').value,
          routeTitle: currentRoute ? currentRoute.title : 'Ruta Jepira',
          unitPrice: currentRoute ? currentRoute.price : 0,
          bookingDate: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
          seatsBooked: seatsInput ? parseInt(seatsInput.value, 10) : 1
        };

        const response = reservationsApp.createReservation(bookingData);

        if (response.success) {
          localStorage.setItem('jepira_latest_booking', JSON.stringify(response.reservation));

          if (contenedorMensaje) {
            contenedorMensaje.style.color = '#2e7d32';
            contenedorMensaje.textContent = '¡Reserva realizada con éxito! Redirigiendo...';
          }

          setTimeout(() => {
            window.location.href = 'confirmacion-reserva.html';
          }, 1500);
        } else {
          if (contenedorMensaje) {
            contenedorMensaje.style.color = '#d32f2f';
            contenedorMensaje.textContent = response.message || 'Error al procesar la reserva.';
          }
        }
      });
    }
  }

  // ==========================================
  // CONEXIÓN: CONFIRMACIÓN DE RESERVA (confirmacion-reserva.html)
  // ==========================================
  const contenedorConfirmacion = document.getElementById('resumen-confirmacion');
  if (contenedorConfirmacion) {
    const latestBooking = JSON.parse(localStorage.getItem('jepira_latest_booking'));

    if (!latestBooking) {
      contenedorConfirmacion.innerHTML = `
        <div style="text-align: center; padding: 40px; background: #fff; border-radius: 12px;">
          <p style="color: #666;">No se encontró ninguna reserva reciente.</p>
          <a href="rutas.html" class="btn-primary" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #2e7d32; color: #fff; text-decoration: none; border-radius: 6px;">Ver Rutas</a>
        </div>
      `;
    } else {
      const totalFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
      }).format(latestBooking.totalPrice || (latestBooking.unitPrice * latestBooking.seatsBooked));

      contenedorConfirmacion.innerHTML = `
        <div class="confirm-card" style="background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 600px; margin: 0 auto; text-align: left;">
          <h2 style="color: #2e7d32; margin-bottom: 20px; text-align: center;">¡Reserva Confirmada! 🎉</h2>
          <p style="margin-bottom: 10px;"><strong>Código de Reserva:</strong> ${latestBooking.id}</p>
          <p style="margin-bottom: 10px;"><strong>Titular:</strong> ${latestBooking.userName}</p>
          <p style="margin-bottom: 10px;"><strong>Documento / Cédula:</strong> ${latestBooking.userDocument || 'No registrado'}</p>
          <p style="margin-bottom: 10px;"><strong>Experiencia / Ruta:</strong> ${latestBooking.routeTitle}</p>
          <p style="margin-bottom: 10px;"><strong>Fecha del viaje:</strong> ${latestBooking.bookingDate}</p>
          <p style="margin-bottom: 10px;"><strong>Cupos reservados:</strong> ${latestBooking.seatsBooked}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <h3 style="color: #1b4332; font-size: 1.3rem; justify-content: space-between; display: flex;">
            <span>Total a pagar:</span>
            <span>${totalFormateado}</span>
          </h3>
          <div style="margin-top: 25px; text-align: center;">
            <a href="mis-reservas.html" style="display: inline-block; padding: 12px 24px; background: #2e7d32; color: #fff; text-decoration: none; font-weight: 600; border-radius: 8px;">Ir a Mis Reservas</a>
          </div>
        </div>
      `;
    }
  }

  // ==========================================
  // CONEXIÓN: MIS RESERVAS (mis-reservas.html)
  // ==========================================
  const containerReservas = document.getElementById('contenedor-reservas');

  if (containerReservas) {
    if (!currentUser) {
      containerReservas.innerHTML = `<p style="text-align:center; color:#666; padding: 40px 0;">Debes iniciar sesión para ver tus reservas.</p>`;
    } else {
      const userReservations = reservationsApp.getReservationsByUser(currentUser.id);

      if (userReservations.length === 0) {
        containerReservas.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <p style="color: #666; font-size: 1rem; margin-bottom: 15px;">Aún no tienes reservas activas.</p>
            <a href="rutas.html" class="btn-primary" style="display: inline-block; padding: 10px 20px; background: #2e7d32; color: #fff; border-radius: 6px; text-decoration: none;">Ver Rutas Disponibles</a>
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
          }).format(res.totalPrice || (res.unitPrice * res.seatsBooked) || 0);

          return `
            <div class="reservation-card" id="card-${res.id}" style="background: #fff; padding: 20px; margin-bottom: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div>
                <div class="res-title" style="font-weight: 700; font-size: 1.1rem; color: #1b4332;">${res.routeTitle || 'Reserva de Ruta'}</div>
                <div class="res-details" style="font-size: 0.9rem; color: #555; margin-top: 5px;">
                  <strong>Fecha de viaje:</strong> ${fechaFormat}<br>
                  <strong>Cupos reservados:</strong> ${res.seatsBooked || 1}<br>
                  <strong>Total:</strong> ${precioTotal}
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                <span class="badge-confirmed" style="background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.8rem;">Confirmada</span>
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

  // ==========================================
  // CONEXIÓN: PANEL DE EMPRESA (panel-empresa.html)
  // ==========================================
  const empresaNombreContainer = document.getElementById('empresa-nombre');
  if (empresaNombreContainer) {
    if (!currentUser || currentUser.role !== 'corporate') {
      alert('Acceso no autorizado. Inicia sesión con una cuenta de empresa.');
      window.location.href = 'login.html';
    } else {
      empresaNombreContainer.textContent = currentUser.name;
    }
  }

});