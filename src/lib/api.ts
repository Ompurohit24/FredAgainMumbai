// All saved state goes through here. Later we can swap localStorage for FastAPI fetch calls.
const P = 'again:'
export const api = {
  async get<T>(key: string, fallback: T): Promise<T> { try { const v = localStorage.getItem(P + key); return v ? (JSON.parse(v) as T) : fallback } catch { return fallback } },
  async set(key: string, value: unknown): Promise<void> { try { localStorage.setItem(P + key, JSON.stringify(value)) } catch { /* storage unavailable */ } },
}
