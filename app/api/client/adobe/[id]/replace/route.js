import { NextResponse } from 'next/server';
import { getAdobeAccountByAccessToken, getActiveUnassignedAdobeAccount, updateAdobeAccountClient, updateClientAdobeAccount } from '@/lib/db';

// [SECURITY] C-01+C-02: Use access_token for lookup instead of sequential ID.
export async function POST(request, { params }) {
  const { id: accessToken } = await params;
  
  if (!accessToken || typeof accessToken !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  // [SECURITY] C-02: Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(accessToken)) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  try {
    const oldAccount = getAdobeAccountByAccessToken(accessToken);
    if (!oldAccount) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    
    const clientId = oldAccount.assigned_client_id;
    if (!clientId) return NextResponse.json({ success: false, error: 'Account not assigned to any client' }, { status: 400 });
    
    // Find a new active account
    const newAccount = getActiveUnassignedAdobeAccount();
    
    if (!newAccount) {
        return NextResponse.json({ success: false, error: 'Нет свободных аккаунтов в пуле' }, { status: 400 });
    }
    
    // Assign new account
    updateAdobeAccountClient(newAccount.id, clientId);
    updateClientAdobeAccount(clientId, newAccount.id);
    
    // Unassign old account
    updateAdobeAccountClient(oldAccount.id, null);
    
    // [SECURITY] Return the new access_token, not numeric ID
    return NextResponse.json({ success: true, new_id: newAccount.access_token });
  } catch (error) {
    console.error('[ClientAdobe Replace] Error:', error);
    // [SECURITY] H-02: Don't leak error details
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
