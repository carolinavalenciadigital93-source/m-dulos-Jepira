import { Storage } from '../storage.js';

export class ReservationsModule {
  constructor() {
    this.reservationsKey = 'jepira_reservations';
  }

  // Obtener todas las reservas
  getAllReservations() {
    return Storage.get(this.reservationsKey) || [];
  }

  // Obtener reservas asociadas a un usuario en específico
  getReservationsByUser(userId) {
    const reservations = this.getAllReservations();
    return reservations.filter(r => r.userId === userId);
  }

  // Crear y guardar una nueva reserva
  createReservation(reservationData) {
    const reservations = this.getAllReservations();
    const newReservation = {
      id: 'res_' + Date.now(),
      createdAt: new Date().toISOString(),
      ...reservationData
    };

    reservations.push(newReservation);
    Storage.set(this.reservationsKey, reservations);
    return { success: true, message: 'Reserva creada exitosamente', reservation: newReservation };
  }

  // Cancelar/Eliminar una reserva por su ID
  cancelReservation(reservationId) {
    let reservations = this.getAllReservations();
    reservations = reservations.filter(r => r.id !== reservationId);
    Storage.set(this.reservationsKey, reservations);
    return { success: true, message: 'Reserva cancelada correctamente' };
  }
}