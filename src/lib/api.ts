export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiOk<T> | ApiFailure;

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  cover_image_url: string | null;
  published_at: string | null;
  updated_at: string;
}

export interface PostDetail extends PostSummary {
  content: string;
}

export async function apiGet<T>(path: string, token?: string): Promise<ApiResponse<T>> {
  const response = await fetch(path, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined
  });
  return (await response.json()) as ApiResponse<T>;
}

export async function apiSend<T>(path: string, body: unknown, token?: string, method = 'POST'): Promise<ApiResponse<T>> {
  const response = await fetch(path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  return (await response.json()) as ApiResponse<T>;
}
