import { NextRequest } from 'next/server';
import { registerUser } from '@/server/services/authService';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await registerUser(body);
    return apiSuccess(result, 'User registered successfully', 201);
  } catch (err) {
    return apiError(err);
  }
}
