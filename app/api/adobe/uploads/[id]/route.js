import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAdobeAccountsByUploadId } from '@/lib/db';

export async function GET(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // [SECURITY] M-01: Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, error: 'Valid ID required' }, { status: 400 });
    }

    const accounts = getAdobeAccountsByUploadId(parseInt(id));
    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('[Adobe Uploads ID]', error);
    // [SECURITY] H-02: Don't leak error details
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
