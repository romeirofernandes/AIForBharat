import { apiFetch } from './client';

// ─── User: File & Track Complaints ─────────────────────────────

export function createComplaint(formData) {
    return apiFetch('/bribery', {
        method: 'POST',
        body: formData, // FormData — apiFetch will strip Content-Type
    });
}

export function getMyComplaints(status) {
    const qs = status ? `?status=${status}` : '';
    return apiFetch(`/bribery/my${qs}`);
}

export function getMyComplaintById(id) {
    return apiFetch(`/bribery/my/${id}`);
}

export function transcribeAndParse(formData) {
    return apiFetch('/bribery/transcribe', {
        method: 'POST',
        body: formData,
    });
}

// ─── Admin: Review & Manage ────────────────────────────────────

export function getAllBriberyComplaints(status) {
    const qs = status ? `?status=${status}` : '';
    return apiFetch(`/bribery/admin/all${qs}`);
}

export function updateBriberyStatus(id, status, adminNote) {
    return apiFetch(`/bribery/admin/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote }),
    });
}
