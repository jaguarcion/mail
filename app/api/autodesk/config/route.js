import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const configJson = getSetting('autodesk_config');
        if (configJson) {
            return NextResponse.json({ status: 'success', config: JSON.parse(configJson) });
        } else {
            return NextResponse.json({ status: 'success', config: null });
        }
    } catch (err) {
        return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const config = await request.json();
        setSetting('autodesk_config', JSON.stringify(config));
        return NextResponse.json({ status: 'success' });
    } catch (err) {
        return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
    }
}
