import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDashboardStats } from '@/lib/db';

export async function GET(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('[Stats GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
