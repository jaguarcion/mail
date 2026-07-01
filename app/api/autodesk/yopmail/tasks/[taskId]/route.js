import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { isAuthenticated } from '@/lib/auth';

const dbPath = path.resolve(process.cwd(), 'emails.db');

export async function PUT(request, { params }) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const taskId = params.taskId;
        const body = await request.json();
        const { success, error, status, items } = body;

        const db = new Database(dbPath);
        
        const stmt = db.prepare(`
            UPDATE yopmail_tasks 
            SET success = ?, error = ?, status = ?, items_json = ?
            WHERE id = ?
        `);
        
        stmt.run(
            success,
            error,
            status,
            JSON.stringify(items || []),
            taskId
        );

        db.close();

        return NextResponse.json({ status: 'success' });
    } catch (err) {
        return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const taskId = params.taskId;
        
        const db = new Database(dbPath);
        
        const stmt = db.prepare(`DELETE FROM yopmail_tasks WHERE id = ?`);
        stmt.run(taskId);

        db.close();

        return NextResponse.json({ status: 'success' });
    } catch (err) {
        return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
    }
}
