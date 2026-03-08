import { apiFetch } from './client';

export function getAllUsers() {
    return apiFetch('/users');
}

export function getMyReputation() {
    return apiFetch('/users/me/reputation');
}

export function getUserReputation(id) {
    return apiFetch(`/users/${id}/reputation`);
}
