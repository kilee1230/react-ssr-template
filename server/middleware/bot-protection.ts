import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /\.\.(\/|\\)/,           // Path traversal
  /<script/i,              // XSS attempts
  /union.*select/i,        // SQL injection
  /eval\(/i,               // Code injection
  /base64_decode/i,        // Obfuscation
  /\bwget\b|\bcurl\b/i,    // Command injection
];

// Known bad user agents
const BLOCKED_USER_AGENTS = [
  /masscan/i,
  /nmap/i,
  /sqlmap/i,
  /nikto/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /metasploit/i,
];

// Rate limiting store (in-memory, use Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RateLimitConfig = z.object({
  windowMs: z.number().default(60000), // 1 minute
  maxRequests: z.number().default(100),
});

type RateLimitConfig = z.infer<typeof RateLimitConfig>;

export function botProtectionMiddleware(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, maxRequests } = RateLimitConfig.parse(config);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || '';
    const fullUrl = req.originalUrl || req.url;

    // 1. Check for suspicious patterns in URL
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(fullUrl)) {
        console.warn(`[BOT PROTECTION] Blocked suspicious URL from ${ip}: ${fullUrl}`);
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // 2. Check for blocked user agents
    for (const pattern of BLOCKED_USER_AGENTS) {
      if (pattern.test(userAgent)) {
        console.warn(`[BOT PROTECTION] Blocked user agent from ${ip}: ${userAgent}`);
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // 3. Block requests with no user agent
    if (!userAgent) {
      console.warn(`[BOT PROTECTION] Blocked empty user agent from ${ip}`);
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 4. Rate limiting
    const now = Date.now();
    const clientData = rateLimitStore.get(ip);

    if (clientData) {
      if (now < clientData.resetTime) {
        if (clientData.count >= maxRequests) {
          console.warn(`[BOT PROTECTION] Rate limit exceeded for ${ip}`);
          return res.status(429).json({ error: 'Too many requests' });
        }
        clientData.count++;
      } else {
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      }
    } else {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    }

    // 5. Clean up old entries (every 100 requests)
    if (Math.random() < 0.01) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
          rateLimitStore.delete(key);
        }
      }
    }

    next();
  };
}
