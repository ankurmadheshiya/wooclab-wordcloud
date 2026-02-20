import { NextResponse } from 'next/server';

const getPolls = () => (global as any).polls || {};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const polls = getPolls();
    const poll = polls[id];

    if (!poll) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    return NextResponse.json(poll);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const polls = getPolls();
    const poll = polls[id];

    if (!poll) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, answer } = body;

    if (action === 'vote' && answer) {
        if (!poll.isActive) {
            return NextResponse.json({ error: 'Poll is closed' }, { status: 400 });
        }
        poll.votes[answer] = (poll.votes[answer] || 0) + 1;
    } else if (action === 'stop') {
        poll.isActive = false;
    }

    return NextResponse.json(poll);
}
