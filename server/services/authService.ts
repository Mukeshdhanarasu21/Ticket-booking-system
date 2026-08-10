import { registerSchema, loginSchema } from '../validators/schemas';
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/errors';
import { createProfile, getProfileById } from '../repositories/db';

export async function registerUser(body: unknown) {
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const { email, password, fullName, role } = parsed.data;

  // In demo/offline mode or testing
  const mockUserId = crypto.randomUUID();
  const profile = await createProfile({
    id: mockUserId,
    email,
    full_name: fullName,
    role: role || 'USER',
  });

  const token = `demo-token-${role === 'ADMIN' ? 'admin' : 'user'}-${mockUserId}`;

  return {
    user: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
    },
    token,
  };
}

export async function loginUser(body: unknown) {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const { email, password } = parsed.data;

  if (email.toLowerCase().includes('admin')) {
    const adminId = '00000000-0000-0000-0000-000000000001';
    const profile = await getProfileById(adminId);
    return {
      user: {
        id: adminId,
        email: 'admin@eventbooking.com',
        fullName: profile?.full_name || 'System Admin',
        role: 'ADMIN' as const,
      },
      token: `demo-token-admin-${adminId}`,
    };
  }

  const userId = '00000000-0000-0000-0000-000000000002';
  const profile = await getProfileById(userId);
  return {
    user: {
      id: userId,
      email: profile?.email || email,
      fullName: profile?.full_name || 'John Doe',
      role: (profile?.role || 'USER') as 'USER' | 'ADMIN',
    },
    token: `demo-token-user-${userId}`,
  };
}
