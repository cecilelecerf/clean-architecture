import { getSession } from 'next-auth/react';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(
  path: string,
  options: { method?: HttpMethod; body?: any } = {},
): Promise<T> {
  const { user } = await getSession();
  try {
    const res = await fetch(`${apiUrl}/api${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.accessToken || ''}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Une erreur est survenue');

    return data as T;
  } catch (err) {
    toast.error(err.message);
  }
}

export function post<T, B = unknown>(path: string, body: B) {
  return request<T>(path, { method: 'POST', body });
}

export function get<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}
