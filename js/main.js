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

      // Intentar iniciar sesión con el módulo Users (pasando rol como parámetro opcional si tu backend/módulo lo requiere)
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
});

    