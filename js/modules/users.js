import { Storage } from '../storage.js';

export class UsersModule {
    constructor() {
        this.usersKey = 'jepira_users';
        this.currentUserKey = 'jepira_current_user';
    }

    // Registro de Usuarios (Explorer) y Pymes (Corporate)
    registerUser(userData) {
        const users = Storage.get(this.usersKey) || [];

        // 1. Verificar si el correo ya existe
        const existsEmail = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existsEmail) {
            return { success: false, message: 'El correo electrónico ya se encuentra registrado.' };
        }

        // 2. Verificar si el documento/NIT ya existe
        if (userData.document) {
            const existsDoc = users.some(u => u.document === userData.document);
            if (existsDoc) {
                return { success: false, message: 'El número de documento/NIT ya se encuentra registrado.' };
            }
        }

        // 3. Crear el nuevo usuario
        const newUser = {
            id: Date.now(),
            ...userData, 
            email: userData.email.toLowerCase(),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        Storage.set(this.usersKey, users);
        return { success: true, message: 'Registro exitoso.', user: newUser };
    }

    // Inicio de sesión
    login(email, password, expectedRole = null) {
        const users = Storage.get(this.usersKey) || [];
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (!user) {
            return { success: false, message: 'Correo o contraseña incorrectos.' };
        }

        // Validar rol si se especifica
        if (expectedRole && user.role !== expectedRole) {
            const tipoCorrecto = user.role === 'corporate' ? 'Empresa Aliada' : 'Viajero';
            return { 
                success: false, 
                message: `Esta cuenta está registrada como ${tipoCorrecto}. Por favor selecciona la pestaña correspondiente.` 
            };
        }

        Storage.set(this.currentUserKey, user);
        return { success: true, message: 'Inicio de sesión exitoso.', user };
    }

    // Obtener sesión activa
    getCurrentUser() {
        return Storage.get(this.currentUserKey) || null;
    }

    // Actualizar perfil de usuario (Edición de Perfil - CP-003)
    updateProfile(updatedData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return { success: false, message: 'No hay una sesión activa.' };
        }

        // 1. Fusionar los datos actuales con los datos nuevos modificados
        const updatedUser = {
            ...currentUser,
            ...updatedData
        };

        // 2. Actualizar el usuario en la sesión activa
        Storage.set(this.currentUserKey, updatedUser);

        // 3. Actualizar el usuario en la lista general de usuarios
        const users = Storage.get(this.usersKey) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            Storage.set(this.usersKey, users);
        }

        console.log('Perfil actualizado en localStorage:', updatedUser);
        return { success: true, message: 'Perfil actualizado correctamente.', user: updatedUser };
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem(this.currentUserKey);
    }
}
