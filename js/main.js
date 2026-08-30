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
  // CONEXIÓN: CARGAR DETALLE DE LA RUTA (detalle_ruta.html)
  // ==========================================
  const tituloDestino = document.getElementById('ruta-titulo'); // Asegúrate de tener este ID en tu HTML
  if (tituloDestino) {
    const params = new URLSearchParams(window.location.search);
    const routeId = params.get('id');
    const routes = planningApp.getAllRoutes();

    // Buscar la ruta seleccionada o tomar la primera por defecto
    const currentRoute = routes.find(r => r.id === routeId) || routes[0];

    if (currentRoute) {
      tituloDestino.textContent = currentRoute.title;

      const descDestino = document.getElementById('ruta-descripcion');
      if (descDestino) descDestino.textContent = currentRoute.description;

      const imgPrincipal = document.getElementById('imgPrincipal');
      if (imgPrincipal) imgPrincipal.src = currentRoute.image;
    }
  }
});
