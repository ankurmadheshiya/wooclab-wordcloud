import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

// Helper function to extract text
async function extractTextFromFile(f: File) {
    const buffer = await f.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);
    const filename = f.name.toLowerCase();
    
    if (filename.endsWith('.pdf')) {
        const { default: pdf } = await import('pdf-parse');
        const data = await pdf(nodeBuffer);
        return data.text;
    } else if (filename.endsWith('.docx') || filename.endsWith('.pptx')) {
        const officeParser = await import('officeparser');
        return new Promise<string>((resolve, reject) => {
            officeParser.parseOfficeAsync(nodeBuffer)
                .then((text: any) => resolve(text as string))
                .catch((err: any) => reject(err));
        });
    }
    throw new Error('Unsupported file type.');
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const countStr = formData.get('count') as string;
        const count = parseInt(countStr) || 3;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        let sourceText = '';
        try {
            sourceText = await extractTextFromFile(file);
        } catch (err: any) {
            console.error('File extraction failed:', err);
            return NextResponse.json({ error: `File extraction failed: ${err.message}` }, { status: 400 });
        }

        if (!sourceText || sourceText.trim().length < 20) {
            return NextResponse.json({ error: 'No readable text found in file' }, { status: 400 });
        }

        // Limit the text to avoid token limits
        if (sourceText.length > 30000) {
            sourceText = sourceText.substring(0, 30000);
        }

        const systemPrompt = `
      You are an expert educator. Create ${count} interactive audience engagement slides.
      Output ONLY a JSON array of slide objects.
      Each slide must have:
      - type: "POLL_MCQ", "QUIZ_MCQ", "WORD_CLOUD", or "QA"
      - question: string
      - options: array of { text: string, isCorrect: boolean } (at least 2 for MCQ, empty for WORD_CLOUD/QA)
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
        let slides = [];
        try {
            const parsed = JSON.parse(content || '{}');
            slides = parsed.slides || parsed;
            if (!Array.isArray(slides)) slides = [slides];
        } catch (e) {
            console.error('Failed to parse Groq response:', content);
            throw new Error('Invalid JSON response');
        }

        return NextResponse.json(slides);
    } catch (error: any) {
        console.error('AI Generation Failed:', error);
        return NextResponse.json({ error: error.message || 'AI Generation Failed' }, { status: 500 });
    }
}
