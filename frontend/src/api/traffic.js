import { apiFetch } from './client';

// ─── Fines Catalog ─────────────────────────────────────────────
export function getFines({ limit, search } = {}) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit);
    if (search) params.set('search', search);
    const qs = params.toString();
    return apiFetch(`/traffic/fines${qs ? `?${qs}` : ''}`);
}

// ─── Vehicles ──────────────────────────────────────────────────
export function getVehicles() {
    return apiFetch('/traffic/vehicles');
}

export function addVehicle(vehicleNumber) {
    return apiFetch('/traffic/vehicles', {
        method: 'POST',
        body: JSON.stringify({ vehicleNumber }),
    });
}

export function removeVehicle(id) {
    return apiFetch(`/traffic/vehicles/${id}`, { method: 'DELETE' });
}

// ─── Challans ──────────────────────────────────────────────────
export function getChallans(status) {
    const qs = status ? `?status=${status}` : '';
    return apiFetch(`/traffic/challans${qs}`);
}

export function getChallanById(id) {
    return apiFetch(`/traffic/challans/${id}`);
}
