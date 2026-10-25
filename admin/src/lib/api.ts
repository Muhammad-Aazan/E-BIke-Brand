function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim().length > 0) {
    return process.env.NEXT_PUBLIC_API_URL.trim();
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
    return `${window.location.origin}/api/v1`;
  }
  return 'http://localhost:5000/api/v1';
}

export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Query;
}

function buildUrl(path: string, query?: Query) {
  const base = getBaseUrl();
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const url = new URL(path.replace(/^\//, ''), normalizedBase);
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });
  return url;
}

export async function adminApi<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, query, headers, ...init } = opts;

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('admin_token');
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
  });

  // Automatic silent refresh on 401
  if (res.status === 401 && path !== 'auth/login' && path !== 'auth/refresh') {
    try {
      const refreshRes = await fetch(buildUrl('auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (refreshRes.ok) {
        const refreshJson: any = await refreshRes.json();
        const newToken = refreshJson?.data?.accessToken;
        if (newToken && typeof window !== 'undefined') {
          localStorage.setItem('admin_token', newToken);

          // Retry original request with newly refreshed token
          const retryRes = await fetch(buildUrl(path, query), {
            credentials: 'include',
            ...init,
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${newToken}`,
              ...(body !== undefined && { 'Content-Type': 'application/json' }),
              ...headers,
            },
            body: body === undefined ? undefined : JSON.stringify(body),
          });

          const retryJson: any = await retryRes.json().catch(() => null);
          if (retryRes.ok) {
            if (retryJson && typeof retryJson === 'object' && 'data' in retryJson) {
              return retryJson.data as T;
            }
            return retryJson as T;
          }
        }
      }
    } catch {
      // Refresh failed, proceed to handle original error
    }
  }

  const json: any = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = json?.error || json?.message || res.statusText || 'Request failed';
    throw new AdminApiError(res.status, msg, json);
  }

  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}
