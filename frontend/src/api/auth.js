import { apiFetch } from './client';

export function login(email, password) {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export function signup(email, password) {
    return apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export function getProfile() {
    return apiFetch('/auth/profile');
}

export function updateProfile(data) {
    const isFormData = data instanceof FormData;
    return apiFetch('/auth/profile', {
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
    });
}

export function generateWhatsappOtp(phone) {
    return apiFetch('/auth/whatsapp/generate-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
    });
}
