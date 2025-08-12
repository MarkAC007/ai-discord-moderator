import { rateLimiter } from '../utils/rateLimit';

// Mock environment variables for testing
process.env['DISCORD_BOT_TOKEN'] = 'test-token';
process.env['DISCORD_APP_ID'] = 'test-app-id';
process.env['OPENAI_API_KEY'] = 'test-openai-key';
process.env['LOG_LEVEL'] = 'error';

describe('RateLimiter', () => {
  // Clean up intervals after all tests
  afterAll(() => {
    // Clear any remaining intervals
    jest.clearAllTimers();
  });
  beforeEach(() => {
    // Reset rate limiter state before each test
    (rateLimiter as any).limits.clear();
  });

  test('should allow first request', () => {
    const userId = 'test-user-1';
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
  });

  test('should allow multiple requests within limit', () => {
    const userId = 'test-user-2';
    
    // Make 10 requests (the limit)
    for (let i = 0; i < 10; i++) {
      expect(rateLimiter.isRateLimited(userId)).toBe(false);
    }
  });

  test('should rate limit after exceeding limit', () => {
    const userId = 'test-user-3';
    
    // Make 10 requests (the limit)
    for (let i = 0; i < 10; i++) {
      rateLimiter.isRateLimited(userId);
    }
    
    // 11th request should be rate limited
    expect(rateLimiter.isRateLimited(userId)).toBe(true);
  });

  test('should return correct remaining requests', () => {
    const userId = 'test-user-4';
    
    expect(rateLimiter.getRemainingRequests(userId)).toBe(10);
    
    rateLimiter.isRateLimited(userId);
    expect(rateLimiter.getRemainingRequests(userId)).toBe(9);
  });

  test('should reset after time window', () => {
    const userId = 'test-user-5';
    
    // Make 10 requests
    for (let i = 0; i < 10; i++) {
      rateLimiter.isRateLimited(userId);
    }
    
    // Should be rate limited
    expect(rateLimiter.isRateLimited(userId)).toBe(true);
    
    // Mock time passing by 61 seconds (beyond the 60-second window)
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => originalDateNow() + 61000);
    
    // Should not be rate limited after window expires
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
    
    // Restore original Date.now
    Date.now = originalDateNow;
  });
});
