import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(
  path: string,
  options: { method?: HttpMethod; body?: any } = {},
): Promise<T> {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  console.log(token);
  try {
    console.log(`${apiUrl}/api${path}`);
    const res = await fetch(`${apiUrl}/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(error.message || `Erreur HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('Response data:', data);
    return data as T;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

export function post<T, B = unknown>(path: string, body: B) {
  return request<T>(path, { method: 'POST', body });
}

export function get<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}

export function patch<T, B = unknown>(path: string, body: B) {
  return request<T>(path, { method: 'PATCH', body });
}
export function deleteEntity<T>(path: string) {
  return request<T>(path, { method: 'DELETE' });
}
