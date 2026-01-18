const BASE_URL = import.meta.env.VITE_BACKEND_URL

function url(path: string) {
  return `${BASE_URL}${path}`
}

async function ensureOk(res: Response) {
  if (!res.ok) throw new Error(await res.text())
  return res
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await ensureOk(await fetch(url(path)))
  return res.json()
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await ensureOk(await fetch(url(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }))
  return res.json()
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await ensureOk(await fetch(url(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }))
  return res.json()
}

export async function apiPatch<T>(path: string): Promise<T> {
  const res = await ensureOk(await fetch(url(path), { method: "PATCH" }))
  return res.json()
}
