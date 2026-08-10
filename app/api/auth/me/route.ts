import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    return apiSuccess(user, 'User profile fetched', 200);
  } catch (err) {
    return apiError(err);
  }
}
