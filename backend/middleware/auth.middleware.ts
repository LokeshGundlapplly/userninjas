import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/database';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.error('Supabase Auth error verifying JWT:', error);
      throw new UnauthorizedError('Invalid authorization session or token expired');
    }

    // Set request user
    req.user = {
      id: user.id,
      email: user.email || '',
    };

    next();
  } catch (error) {
    next(error);
  }
}
