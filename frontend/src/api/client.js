const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Wrapper around fetch that automatically attaches the JWT token
 */
export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    // Remove Content-Type if sending FormData so browser sets it with boundary
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}
