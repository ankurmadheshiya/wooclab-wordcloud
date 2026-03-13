import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { title, hostId } = await req.json();

        // Generate a unique 6-digit join code
        let joinCode = '';
        let isUnique = false;

        while (!isUnique) {
            joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existing = await prisma.session.findUnique({ where: { joinCode } });
            if (!existing) isUnique = true;
        }

        const session = await prisma.session.create({
            data: {
                title: title || 'New Interactive Session',
                joinCode,
                hostId: hostId || 'anonymous-host',
                status: 'DRAFT',
            },
        });

        return NextResponse.json(session);
    } catch (error: any) {
        console.error('Failed to create session:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message, stack: error.stack }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const hostId = searchParams.get('hostId');

        if (!hostId) {
            return NextResponse.json({ error: 'Host ID required' }, { status: 400 });
        }

        const sessions = await prisma.session.findMany({
            where: { hostId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { slides: true }
                }
            }
        });

        return NextResponse.json(sessions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}
