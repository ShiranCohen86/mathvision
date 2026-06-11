const BASE = import.meta.env.VITE_API_BASE ?? '/api';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    const message = body?.message || body?.error || `Request failed: ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return body;
}

export const getHealth = () => apiFetch('/health');

export const solveProblem = (problem) =>
  apiFetch('/solve', { method: 'POST', body: JSON.stringify({ problem }) });

export const getMe = async () => {
  try {
    return await apiFetch('/auth/me');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
};

export const logout = () => apiFetch('/auth/logout', { method: 'POST' });

export const getHistory = () => apiFetch('/history');

export const getProgress = () => apiFetch('/progress');

export const getLeaderboard = () => apiFetch('/progress/leaderboard');

export const getPracticeProblem = (kind) =>
  apiFetch(`/practice/new${kind ? `?kind=${kind}` : ''}`);

export const getDailyChallenge = () => apiFetch('/practice/daily');
