import { apiFetch } from './client';

export function getLeaderboard() {
    return apiFetch('/leaderboard');
}
