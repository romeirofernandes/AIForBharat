import { apiFetch } from './client';

export function getWorkflow(id) {
    return apiFetch(`/workflows/${id}`);
}

export function getClusterWorkflows(clusterKey) {
    return apiFetch(`/workflows?clusterKey=${encodeURIComponent(clusterKey)}`);
}

export function updateWorkflowStep(stepId, data) {
    return apiFetch(`/workflows/step/${stepId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}
