import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { sessionId, slideId, participantId, nickname, content } = await req.json();

        const response = await prisma.response.create({
            data: {
                sessionId,
                slideId,
                participantId,
                nickname,
                content,
            },
        });

        // In a full implementation, we would also trigger a Socket.IO event here
        // or via a separate WebSocket server.

        return NextResponse.json(response);
    } catch (error) {
        console.error('Failed to submit response:', error);
        return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
    }
}
