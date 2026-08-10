import { NextRequest } from 'next/server';
import { supabaseAdmin, supabasePublic } from '../repositories/supabaseClient';
import { getProfileById, createProfile, Profile } from '../repositories/db';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
}

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  // Demo / Local Auth Token Handling for Dev & Automated Tests
  if (token.startsWith('demo-token-')) {
    const role = token.includes('admin') ? 'ADMIN' : 'USER';
    const userId = role === 'ADMIN' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002';
    const profile = await getProfileById(userId);

    return {
      id: userId,
      email: profile?.email || (role === 'ADMIN' ? 'admin@eventbooking.com' : 'user@eventbooking.com'),
      fullName: profile?.full_name || (role === 'ADMIN' ? 'System Admin' : 'John Doe'),
      role,
    };
  }

  if (!token) {
    throw new UnauthorizedError('Authentication token missing');
  }

  try {
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);
    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    let profile = await getProfileById(user.id);
    if (!profile) {
      profile = await createProfile({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 'User',
        role: 'USER',
      });
    }

    return {
      id: user.id,
      email: user.email || profile.email,
      fullName: profile.full_name,
      role: profile.role,
    };
  } catch (err: any) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError('Failed to authenticate request');
  }
}

export async function requireAuth(req: NextRequest): Promise<AuthenticatedUser> {
  return getAuthenticatedUser(req);
}

export async function requireAdmin(req: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(req);
  if (user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin privileges required to access this resource');
  }
  return user;
}
