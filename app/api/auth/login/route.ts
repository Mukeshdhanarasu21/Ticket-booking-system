import { NextRequest } from 'next/server';
import { loginUser } from '@/server/services/authService';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await loginUser(body);
    return apiSuccess(result, 'Login successful', 200);
  } catch (err) {
    return apiError(err);
  }
}
