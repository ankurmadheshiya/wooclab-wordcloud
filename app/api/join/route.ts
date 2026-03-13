import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { joinCode } = await req.json();

        if (!joinCode) {
            return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
        }

        const session = await prisma.session.findUnique({
            where: { joinCode: joinCode.toUpperCase() },
            include: {
                _count: {
                    select: { slides: true }
                }
            }
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        if (session.status === 'FINISHED') {
            return NextResponse.json({ error: 'This session has ended' }, { status: 400 });
        }

        return NextResponse.json(session);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
