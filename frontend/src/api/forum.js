import { apiFetch } from './client';

export function getForumFeed({ status, department, sort, search } = {}) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (department) params.set('department', department);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);
    const qs = params.toString();
    return apiFetch(`/forum/feed${qs ? `?${qs}` : ''}`);
}

export function voteIssue(issueId, value) {
    return apiFetch(`/forum/issues/${issueId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ value }),
    });
}

export function getIssueComments(issueId) {
    return apiFetch(`/forum/issues/${issueId}/comments`);
}

export function addIssueComment(issueId, body, parentId = null) {
    return apiFetch(`/forum/issues/${issueId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body, parentId }),
    });
}

export function voteComment(commentId, value) {
    return apiFetch(`/forum/comments/${commentId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ value }),
    });
}

export function getIssueWorkflow(issueId) {
    return apiFetch(`/forum/issues/${issueId}/workflow`);
}
