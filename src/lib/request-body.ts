export async function readJsonBody<T>(request: Request, maxBytes = 16_384): Promise<{ data: T } | { error: "invalid" | "too_large" }> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) return { error: "too_large" };

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) return { error: "too_large" };

  try {
    return { data: JSON.parse(text) as T };
  } catch {
    return { error: "invalid" };
  }
}
