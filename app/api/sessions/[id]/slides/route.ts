import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { type, question, order, options, settings } = await req.json();
        const sessionId = id;

        const slide = await prisma.slide.create({
            data: {
                sessionId,
                type,
                question,
                order,
                settings: JSON.stringify(settings || {}),
                options: {
                    create: options?.map((opt: any) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect || false,
                    })) || [],
                },
            },
            include: {
                options: true,
            },
        });

        return NextResponse.json(slide);
    } catch (error: any) {
        console.error('Failed to add slide:', error);
        return NextResponse.json({ error: 'Failed to add slide', details: error.message, stack: error.stack }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const slides = await prisma.slide.findMany({
            where: { sessionId: id },
            orderBy: { order: 'asc' },
            include: {
                options: true,
            },
        });

        return NextResponse.json(slides);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
    }
}
