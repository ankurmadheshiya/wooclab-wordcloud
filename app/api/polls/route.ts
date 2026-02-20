import { NextResponse } from 'next/server';

// Global simulation store
// Note: This only works in development where the server process persists.
// In Vercel serverless, this will reset on every invocation.
const globalPolls = (global as any).polls || {};
(global as any).polls = globalPolls;

export async function POST(request: Request) {
    const body = await request.json();
    const { id, question, type, options } = body;

    globalPolls[id] = {
        id,
        question,
        type,
        options,
        isActive: true,
        votes: {},
        createdAt: Date.now()
    };

    return NextResponse.json({ success: true, poll: globalPolls[id] });
}

export async function GET() {
    return NextResponse.json({ polls: globalPolls });
}
