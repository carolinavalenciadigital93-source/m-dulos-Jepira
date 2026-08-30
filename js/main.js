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
      e.preventDefault(); // Evita que la página se recargue

      // Capturar los valores del formulario
      const userData = {
        role: document.getElementById('reg-tipo').value,
        name: document.getElementById('reg-nombre').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-telefono').value,
        password: document.getElementById('reg-password').value
      };

      // Ejecutar la función del módulo Users
      const response = usersApp.registerUser(userData);
      const contenedorMensaje = document.getElementById('mensaje-registro');

      if (response.success) {
        contenedorMensaje.style.color = 'green';
        contenedorMensaje.textContent = response.message + ' Redirigiendo al login...';
        formRegistro.reset();

        // Redirigir al Login después de 1.5 segundos
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } else {
        contenedorMensaje.style.color = 'red';
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

      // Intentar iniciar sesión con el módulo Users
      const response = usersApp.login(email, password);
      const contenedorMensaje = document.getElementById('mensaje-login');

      if (response.success) {
        contenedorMensaje.style.color = 'green';
        contenedorMensaje.textContent = '¡Bienvenido! Redirigiendo...';

        // Redirigir según el tipo de usuario (Corporate o Explorer)
        setTimeout(() => {
          if (response.user.role === 'corporate') {
            window.location.href = 'panel-empresa.html';
          } else {
            window.location.href = 'mis-reservas.html';
          }
        }, 1000);
      } else {
        contenedorMensaje.style.color = 'red';
        contenedorMensaje.textContent = response.message;
      }
    });
  }
});

    