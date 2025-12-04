import { getSession } from 'next-auth/react';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(
  path: string,
  options: { method?: HttpMethod; body?: any } = {},
): Promise<T> {
  const session = await getSession();
  const token = session?.user?.accessToken;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${apiUrl}/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Une erreur est survenue');

    return data as T;
  } catch (err) {
    toast.error(err.message);
  }
}

<<<<<<< HEAD:interfaces/app-next/src/lib/apiClient.ts
type Scope = 'client' | 'director' | 'advisor' | 'other';
export function post<T, B = unknown>(path: string, body: B, scope?: Scope) {
  const userScope = scope ? `/${scope}` : '';
  return request<T>(`${userScope}${path}`, { method: 'POST', body });
}

export function get<T>(path: string, scope?: Scope) {
  const userScope = scope ? `/${scope}` : '';
  return request<T>(`${userScope}${path}`, { method: 'GET' });
}

export function patch<T, B = unknown>(path: string, body: B, scope?: Scope) {
  const userScope = scope ? `/${scope}` : '';
  return request<T>(`${userScope}${path}`, { method: 'PATCH', body });
}
export function deleteEntity<T, B = unknown>(path: string, scope?: Scope) {
  const userScope = scope ? `/${scope}` : '';
  return request<T>(`${userScope}${path}`, { method: 'DELETE' });
=======
export function post<T, B = unknown>(
  path: string,
  body: B,
  user?: 'client' | 'director' | 'activisor' | 'other',
) {
  const addUser = user ? `/${user}` : '';
  return request<T>(`${addUser}${path}`, { method: 'POST', body });
}

export function get<T>(path: string, user?: 'client' | 'director' | 'activisor' | 'other') {
  const addUser = user ? `/${user}` : '';
  return request<T>(`${addUser}${path}`, { method: 'GET' });
>>>>>>> 2ce9cab (thread):interfaces/web/app-next/src/lib/apiClient.ts
}
