import { ReservationsModule } from './modules/reservations.js'; // Ajusta la ruta si es necesario
import { Auth } from './modules/auth.js'; // O la clase/módulo donde gestiones la sesión actual

const reservationsModule = new ReservationsModule();

// Obtener el usuario autenticado (ejemplo tomando la sesión activa)
const currentUser = JSON.parse(localStorage.getItem('jepira_current_user'));

function renderUserReservations() {
    const container = document.getElementById('contenedor-reservas');
    if (!container) return;

    if (!currentUser) {
        container.innerHTML = `<p style="text-align:center; color:#666;">Debes iniciar sesión para ver tus reservas.</p>`;
        return;
    }

    // Obtener solo las reservas del usuario activo
    const userReservations = reservationsModule.getReservationsByUser(currentUser.id);

    if (userReservations.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <p style="color: #666; font-size: 1rem; margin-bottom: 15px;">Aún no tienes reservas activas.</p>
                <a href="rutas.html" class="btn-primary" style="display: inline-block;">Ver Rutas Disponibles</a>
            </div>
        `;
        return;
    }

    // Renderizar tarjetas de reservas
    container.innerHTML = userReservations.map(res => {
        const fechaFormat = new Date(res.bookingDate).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const precioTotal = new Intl.NumberFormat('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            maximumFractionDigits: 0 
        }).format(res.totalPrice);

        return `
            <div class="reservation-card" id="card-${res.id}">
                <div>
                    <div class="res-title">${res.routeTitle}</div>
                    <div class="res-details">
                        <strong>Fecha de reserva:</strong> ${fechaFormat}<br>
                        <strong>Cupos reservados:</strong> ${res.seatsBooked}<br>
                        <strong>Total:</strong> ${precioTotal}
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                    <span class="badge-confirmed">Confirmada</span>
                    <button onclick="cancelarReserva('${res.id}')" class="btn-logout" style="padding: 6px 12px; font-size: 0.8rem;">
                        Cancelar Reserva
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
