import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(req: Request) {
    try {
        const { sourceText, type = 'MIXED', count = 3 } = await req.json();

        const systemPrompt = `
      You are an expert educator. Create ${count} interactive audience engagement slides.
      Output ONLY a JSON array of slide objects.
      Each slide must have:
      - type: "POLL_MCQ", "QUIZ_MCQ", or "WORD_CLOUD"
      - question: string
      - options: array of { text: string, isCorrect: boolean } (at least 2 for MCQ, empty for WORD_CLOUD)
    `;

        const userPrompt = `Source content: ${sourceText}`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content;
        const slides = JSON.parse(content || '[]').slides || JSON.parse(content || '[]');

        return NextResponse.json(slides);
    } catch (error) {
        console.error('AI Generation Failed:', error);
        return NextResponse.json({ error: 'AI Generation Failed' }, { status: 500 });
    }
}
