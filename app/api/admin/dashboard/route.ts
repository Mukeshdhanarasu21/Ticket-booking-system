import { NextRequest } from 'next/server';
import { fetchDashboardStats } from '@/server/services/adminService';
import { requireAdmin } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const stats = await fetchDashboardStats();
    return apiSuccess(stats, 'Admin dashboard metrics loaded', 200);
  } catch (err) {
    return apiError(err);
  }
}
