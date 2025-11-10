type Json = Record<string, unknown> | Array<unknown>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: Json;
  timeoutMs?: number;
  bearerToken?: string;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs?: number): Promise<T> {
  if (!timeoutMs) {
    return promise;
  }

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export async function requestJson<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = "POST", headers = {}, body, timeoutMs, bearerToken } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (bearerToken) {
    finalHeaders.Authorization = `Bearer ${bearerToken}`;
  }

  const response = await withTimeout(
    fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    }),
    timeoutMs,
  );

  const text = await response.text();
  const asJson = text ? (JSON.parse(text) as T) : (undefined as unknown as T);

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status} ${response.statusText}) to ${url}: ${text || "No body returned"}`,
    );
  }

  return asJson;
}

