import { Request, Response, NextFunction } from 'express';
import { sessionsCollection, userAccountsCollection, UserAccountRecord } from './models.js';

export interface AuthenticatedRequest extends Request {
  user?: UserAccountRecord;
  sessionToken?: string;
}

export function extractSessionToken(req: Request): string | null {
  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.ecotrack_session) {
    return req.cookies.ecotrack_session;
  }
  // 2. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractSessionToken(req);

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in with your SGU collegiate credentials.',
    });
  }

  const session = await sessionsCollection.findById(token);
  if (!session) {
    return res.status(401).json({
      error: 'Invalid or expired session. Please sign in again.',
    });
  }

  // Validate session expiration
  if (new Date(session.expiresAt) < new Date()) {
    await sessionsCollection.delete(token);
    return res.status(401).json({
      error: 'Session expired. Please re-authenticate.',
    });
  }

  const user = await userAccountsCollection.findById(session.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({
      error: 'User account disabled or not found.',
    });
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

export function requireRole(allowedRoles: ('student' | 'faculty' | 'admin')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. This operation requires one of the following roles: [${allowedRoles.join(', ')}].`,
      });
    }

    next();
  };
}
