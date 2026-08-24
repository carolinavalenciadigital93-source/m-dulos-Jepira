import { UsersModule } from './modules/users.js';
import { PlanningModule } from './modules/planning.js';
import { ReservationsModule } from './modules/reservations.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar módulos
    const usersApp = new UsersModule();
    const planningApp = new PlanningModule();
    const reservationsApp = new ReservationsModule();

    console.log('Sistema Jepira cargado correctamente con todos sus módulos.');
});