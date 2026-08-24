import { Storage } from '../storage.js';

export class ReservationsModule {
    constructor() {
        this.reservationsKey = 'jepira_reservations';
        this.routesKey = 'jepira_routes';
    }

    // 1. Obtener todas las reservas
    getAllReservations() {
        return Storage.get(this.reservationsKey);
    }

    // 2. Obtener reservas de un usuario específico (Explorer)
    getReservationsByUser(userId) {
        const reservations = this.getAllReservations();
        return reservations.filter(r => r.userId === userId);
    }

    // 3. Crear una nueva reserva de cupos
    createReservation(userId, routeId, seatsToBook) {
        const routes = Storage.get(this.routesKey);
        const routeIndex = routes.findIndex(r => r.id === routeId);

        if (routeIndex === -1) {
            return { success: false, message: 'La ruta seleccionada no existe.' };
        }

        const route = routes[routeIndex];

        if (route.availableSeats < seatsToBook) {
            return { success: false, message: 'No hay suficientes cupos disponibles para esta ruta.' };
        }

        // Descontar cupos de la ruta
        routes[routeIndex].availableSeats -= seatsToBook;
        Storage.set(this.routesKey, routes);

        // Registrar la reserva
        const reservations = this.getAllReservations();
        const newReservation = {
            id: 'res_' + Date.now(),
            userId,
            routeId,
            routeTitle: route.title,
            seatsBooked: Number(seatsToBook),
            totalPrice: route.price * seatsToBook,
            bookingDate: new Date().toISOString()
        };

        reservations.push(newReservation);
        Storage.set(this.reservationsKey, reservations);

        return { success: true, message: 'Reserva realizada con éxito.', reservation: newReservation };
    }

    // 4. Cancelar una reserva
    cancelReservation(reservationId, userId) {
        let reservations = this.getAllReservations();
        const reservation = reservations.find(r => r.id === reservationId && r.userId === userId);

        if (!reservation) {
            return { success: false, message: 'No se encontró la reserva.' };
        }

        // Devolver cupos a la ruta
        const routes = Storage.get(this.routesKey);
        const routeIndex = routes.findIndex(r => r.id === reservation.routeId);

        if (routeIndex !== -1) {
            routes[routeIndex].availableSeats += reservation.seatsBooked;
            Storage.set(this.routesKey, routes);
        }

        // Eliminar reserva de la lista
        reservations = reservations.filter(r => r.id !== reservationId);
        Storage.set(this.reservationsKey, reservations);

        return { success: true, message: 'Reserva cancelada correctamente.' };
    }
}