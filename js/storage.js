// Manejo de almacenamiento local (Simulador de Base de Datos)
export const Storage = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data))
};