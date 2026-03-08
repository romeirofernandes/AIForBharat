import { apiFetch } from './client';

export function createIssue(data) {
    return apiFetch('/issues', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function getMyIssues() {
    return apiFetch('/issues/my');
}

export function getAllIssues(status) {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/issues/all${query}`);
}

export function updateIssueStatus(id, status) {
    return apiFetch(`/issues/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
}

export function getStats() {
    return apiFetch('/issues/stats');
}

export function getAggregatedIssues() {
    return apiFetch('/issues/aggregated');
}

export function getResolutionFlow({ incidentType, department, count, sampleDescriptions }) {
    return apiFetch('/issues/resolution-flow', {
        method: 'POST',
        body: JSON.stringify({ incidentType, department, count, sampleDescriptions }),
    });
}

