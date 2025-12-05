# Bot Protection Middleware

Protects the application from suspicious bot attacks and malicious requests.

## Features

1. **Pattern Detection**: Blocks requests with suspicious patterns
   - Path traversal attempts (`../`)
   - XSS attempts (`<script>`)
   - SQL injection (`union select`)
   - Code injection (`eval()`)
   - Command injection (`wget`, `curl`)

2. **User Agent Filtering**: Blocks known scanning tools
   - masscan, nmap, sqlmap
   - nikto, acunetix, nessus
   - openvas, metasploit

3. **Empty User Agent Blocking**: Rejects requests without user agent

4. **Rate Limiting**: Prevents abuse
   - Default: 100 requests per minute per IP
   - Configurable window and limits

## Configuration

```typescript
app.use(botProtectionMiddleware({
  windowMs: 60000,    // Time window in ms (default: 1 minute)
  maxRequests: 100,   // Max requests per window (default: 100)
}));
```

## Production Considerations

For production, consider:

1. **Use Redis for rate limiting** instead of in-memory store
2. **Add AWS WAF** for additional protection at the ALB level
3. **Enable CloudWatch logging** for blocked requests
4. **Implement IP allowlist** for known good clients
5. **Add CAPTCHA** for repeated violations

## AWS WAF Integration

For better protection, add AWS WAF to your CDK stack:

```typescript
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

const webAcl = new wafv2.CfnWebACL(this, 'WebAcl', {
  scope: 'REGIONAL',
  defaultAction: { allow: {} },
  rules: [
    {
      name: 'RateLimitRule',
      priority: 1,
      statement: {
        rateBasedStatement: {
          limit: 2000,
          aggregateKeyType: 'IP',
        },
      },
      action: { block: {} },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'RateLimitRule',
      },
    },
  ],
  visibilityConfig: {
    sampledRequestsEnabled: true,
    cloudWatchMetricsEnabled: true,
    metricName: 'WebAcl',
  },
});
```

## Monitoring

Check logs for blocked requests:

```bash
# In development
pnpm run dev
# Watch for "[BOT PROTECTION]" messages

# In production (CloudWatch)
aws logs tail /ecs/react-ssr --follow
```
