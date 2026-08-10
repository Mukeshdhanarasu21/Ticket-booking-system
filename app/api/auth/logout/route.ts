import { NextRequest } from 'next/server';
import { apiSuccess } from '@/server/utils/response';

export async function POST(req: NextRequest) {
  return apiSuccess(null, 'Logged out successfully', 200);
}
