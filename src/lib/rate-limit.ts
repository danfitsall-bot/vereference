const requests = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory IP-based rate limiter.
 * Returns true if the request is allowed, false if rate-limited.
 */
export function rateLimit(ip: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = requests.get(ip);
  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}
