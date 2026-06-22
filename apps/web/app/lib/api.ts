/**
 * Thin wrapper around fetch for talking to the Lynq API.
 *
 * - On the server, calls hit the API directly via NEXT_PUBLIC_API_BASE_URL.
 * - On the client we hit the same base URL (CORS is enabled in main.ts).
 * - Errors are surfaced as `ApiError` so UI can render the message.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/v1';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  const text = await res.text();
  const body = text ? safeParse(text) : null;

  if (!res.ok) {
    const issues =
      body && typeof body === 'object' && Array.isArray((body as { issues?: unknown }).issues)
        ? ((body as { issues: { path: (string | number)[]; message: string }[] }).issues)
        : null;
    const baseMessage =
      body && typeof body === 'object' && 'message' in body
        ? Array.isArray((body as { message: unknown }).message)
          ? ((body as { message: string[] }).message.join('; '))
          : String((body as { message: unknown }).message)
        : `Request failed: ${res.status}`;
    const message = issues && issues.length
      ? `${baseMessage}: ${issues.map((i) => `${i.path.join('.') || '(root)'} – ${i.message}`).join('; ')}`
      : baseMessage;
    throw new ApiError(res.status, message);
  }

  return body as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
};

// SWR fetcher signature
export const swrFetcher = <T>(path: string) => api.get<T>(path);
