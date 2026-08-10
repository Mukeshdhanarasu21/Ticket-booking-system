import { describe, it, expect, beforeEach } from 'vitest';
import { registerUser, loginUser } from '@/server/services/authService';
import { ValidationError, UnauthorizedError } from '@/server/utils/errors';
import { dbStore } from '@/server/repositories/db';

describe('Auth Service Unit & Integration Tests', () => {
  beforeEach(() => {
    dbStore.seedDefaults();
  });

  it('should register a new user successfully', async () => {
    const res = await registerUser({
      fullName: 'Alice Smith',
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(res.user).toBeDefined();
    expect(res.user.email).toBe('alice@example.com');
    expect(res.user.role).toBe('USER');
    expect(res.token).toContain('demo-token-user-');
  });

  it('should reject registration with invalid email', async () => {
    await expect(
      registerUser({
        fullName: 'Alice',
        email: 'invalid-email',
        password: 'password123',
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should login admin user successfully', async () => {
    const res = await loginUser({
      email: 'admin@eventbooking.com',
      password: 'password123',
    });

    expect(res.user.role).toBe('ADMIN');
    expect(res.token).toContain('demo-token-admin-');
  });
});
