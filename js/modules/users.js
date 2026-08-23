import { Storage } from '../storage.js';

export class UsersModule {
    constructor() {
        this.usersKey = 'jepira_users';
        this.currentUserKey = 'jepira_current_user';
    }

    // Registro de Usuarios (Explorer) y Pymes (Corporate)
    registerUser(userData) {
        const users = Storage.get(this.usersKey);
        
        // Verificar correo existente
        const exists = users.some(u => u.email === userData.email);
        if (exists) {
            return { success: false, message: 'El correo electrónico ya se encuentra registrado.' };
        }

        const newUser = {
            id: Date.now(),
            ...userData, // tipo ('explorer' o 'corporate'), nombre, teléfono, contraseña
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        Storage.set(this.usersKey, users);
        return { success: true, message: 'Registro exitoso.', user: newUser };
    }

    // Inicio de sesión
    login(email, password) {
        const users = Storage.get(this.usersKey);
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Credenciales incorrectas.' };
        }

        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
        return { success: true, message: 'Inicio de sesión exitoso.', user };
    }

    // Obtener sesión activa
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.currentUserKey)) || null;
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem(this.currentUserKey);
    }
}