interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number = 60 * 1000; // 1 minute
  private readonly maxRequests: number = 10; // 10 requests per minute

  isRateLimited(userId: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(userId);

    if (!entry) {
      // First request for this user
      this.limits.set(userId, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    // Check if window has reset
    if (now > entry.resetTime) {
      this.limits.set(userId, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    // Check if user has exceeded limit
    if (entry.count >= this.maxRequests) {
      return true;
    }

    // Increment count
    entry.count++;
    return false;
  }

  getTimeUntilReset(userId: string): number {
    const entry = this.limits.get(userId);
    if (!entry) return 0;
    
    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  getRemainingRequests(userId: string): number {
    const entry = this.limits.get(userId);
    if (!entry) return this.maxRequests;
    
    const now = Date.now();
    if (now > entry.resetTime) return this.maxRequests;
    
    return Math.max(0, this.maxRequests - entry.count);
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [userId, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(userId);
      }
    }
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter();

// Clean up old entries every 5 minutes
const cleanupInterval = setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

// Do not keep the Node.js event loop alive for this background interval
if (typeof (cleanupInterval as any).unref === 'function') {
  (cleanupInterval as any).unref();
}
