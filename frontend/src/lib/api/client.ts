/**
 * Thin fetch wrapper used by every service in this folder.
 * - Sends cookies (credentials: 'include') so HttpOnly JWT cookies work.
 * - Also sends Bearer header if user_token is in localStorage (for cross-origin reliability).
 * - Unwraps `{ success, data }` envelopes automatically; plain JSON works too.
 * - Throws ApiError on non-2xx so callers can try/catch with proper server message.
 */
const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: Query;
  /** Next.js ISR seconds for server-side GETs */
  revalidate?: number;
};

export const isApiConfigured = () => BASE.length > 0;

function buildUrl(path: string, query?: Query) {
  const base = BASE.endsWith('/') ? BASE : `${BASE}/`;
  const url = new URL(path.replace(/^\//, ''), base);
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });
  return url;
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  if (!isApiConfigured()) throw new ApiError(0, 'NEXT_PUBLIC_API_URL is not set');

  const { body, query, revalidate, headers, ...init } = opts;

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('user_token');
  }

  const res = await fetch(buildUrl(path, query), {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(revalidate !== undefined && { next: { revalidate } }),
  });

  const json: any = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error || json?.message || res.statusText || 'Request failed';
    throw new ApiError(res.status, msg, json);
  }
  if (json && typeof json === 'object' && 'data' in json) return json.data as T;
  return json as T;
}
