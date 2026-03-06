import { apiFetch } from './client';

export function getAllUsers() {
    return apiFetch('/users');
}
