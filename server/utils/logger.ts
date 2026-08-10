export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(sanitizeMeta(meta)) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(sanitizeMeta(meta)) : '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(sanitizeMeta(meta)) : '');
  },
};

function sanitizeMeta(meta: any): any {
  if (!meta || typeof meta !== 'object') return meta;
  const sanitized = { ...meta };
  const sensitiveKeys = ['password', 'token', 'access_token', 'service_role_key', 'authorization', 'secret'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}
