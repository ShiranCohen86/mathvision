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
