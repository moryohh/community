import { Request, Response, NextFunction } from 'express';
import { SERVER_CONFIG } from './config';

/**
 * Strict CORS Middleware for Community API & Site 1 requests
 */
export function communityCorsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin as string;
  const allowedOrigins = SERVER_CONFIG.COMMUNITY_ALLOWED_ORIGINS;

  // Handle allowed origin or internal dev
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // Direct server-to-server or non-browser request
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0] || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret, x-recovery-secret, x-user-id');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}
