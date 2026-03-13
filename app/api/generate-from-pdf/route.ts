import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// OpenAI will be initialized dynamically
let openai: any = null;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const pdfText = formData.get('pdfText') as string; // New field for client-side extracted text
        const aiProvider = formData.get('aiProvider') as string || 'gemini';

        if (!file && !pdfText) {
            return NextResponse.json(
                { error: 'PDF file or text is required' },
                { status: 400 }
            );
        }

        const prompt = `
      Based on the provided PDF content, generate 5 engaging multiple-choice questions suitable for a live audience poll.
      
      Return ONLY a raw JSON array with this structure:
      [
        {
          "question": "The question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "The correct option text"
        }
      ]
    `;

        let aiResponseText = '';

        try {
            if (aiProvider === 'openai' && process.env.OPENAI_API_KEY) {
                console.log('Using OpenAI for PDF generation');

                // If we don't have text extracted yet, we try to extract it from the file (legacy/fallback)
                let textToProcess = pdfText || '';

                if (!textToProcess && file) {
                    try {
                        const { default: pdf } = await import('pdf-parse');
                        const buffer = await file.arrayBuffer();
                        const data = await pdf(Buffer.from(buffer));
                        textToProcess = data.text;
                    } catch (e) {
                        console.error('Server-side PDF parsing failed:', e);
                        throw new Error('Could not extract text from PDF on server. Please try using Gemini or ensure client-side extraction is working.');
                    }
                }

                if (!textToProcess || textToProcess.trim().length < 20) {
                    throw new Error('No readable text found in PDF.');
                }

                if (!openai) {
                    const { default: OpenAI } = await import('openai');
                    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                }

                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a quiz generator. Return only JSON." },
                        { role: "user", content: `Text:\n${textToProcess.substring(0, 15000)}\n\n${prompt}` }
                    ],
                    model: "gpt-3.5-turbo-0125",
                });
                aiResponseText = completion.choices[0].message.content || '';
            } else if (aiProvider === 'groq' && process.env.GROQ_API_KEY) {
                console.log('Using Groq for PDF generation');

                let textToProcess = pdfText || '';

                if (!textToProcess && file) {
                    try {
                        const { default: pdf } = await import('pdf-parse');
                        const buffer = await file.arrayBuffer();
                        const data = await pdf(Buffer.from(buffer));
                        textToProcess = data.text;
                    } catch (e) {
                        console.error('Server-side PDF parsing failed for Groq:', e);
                        throw new Error('Could not extract text from PDF on server for Groq.');
                    }
                }

                if (!textToProcess || textToProcess.trim().length < 20) {
                    throw new Error('No readable text found in PDF for Groq.');
                }

                const { default: OpenAI } = await import('openai');
                const groqClient = new OpenAI({
                    apiKey: process.env.GROQ_API_KEY || '',
                    baseURL: "https://api.groq.com/openai/v1",
                });

                const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "mixtral-8x7b-32768"];
                let firstGroqError = null;

                for (const model of groqModels) {
                    try {
                        console.log(`Attempting Groq generation with model: ${model}`);
                        const completion = await groqClient.chat.completions.create({
                            messages: [
                                { role: "system", content: "You are a quiz generator. Return only JSON." },
                                { role: "user", content: `Text:\n${textToProcess.substring(0, 15000)}\n\n${prompt}` }
                            ],
                            model: model,
                            response_format: { type: "json_object" }
                        });
                        aiResponseText = completion.choices[0].message.content || '';
                        if (aiResponseText) {
                            console.log(`✅ Groq generation successful with model: ${model}`);
                            break;
                        }
                    } catch (err: any) {
                        console.warn(`Groq model ${model} failed:`, err.message);
                        if (!firstGroqError) firstGroqError = err;
                    }
                }

                if (!aiResponseText) throw firstGroqError || new Error('All Groq models failed.');
            } else {
                // Gemini path (Supports native PDF upload)
                if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');

                // Models to try in order of preference
                const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
                let firstError: any = null;

                for (const modelName of modelsToTry) {
                    try {
                        console.log(`Attempting Gemini generation with model: ${modelName}`);
                        const model = genAI.getGenerativeModel({ model: modelName });

                        let result;
                        if (file) {
                            const buffer = await file.arrayBuffer();
                            const base64Data = Buffer.from(buffer).toString('base64');
                            result = await model.generateContent([
                                { inlineData: { data: base64Data, mimeType: 'application/pdf' } },
                                prompt
                            ]);
                        } else {
                            result = await model.generateContent(`${pdfText}\n\n${prompt}`);
                        }

                        const response = await result.response;
                        aiResponseText = response.text();
                        if (aiResponseText) break;
                    } catch (err: any) {
                        console.warn(`Model ${modelName} failed:`, err.message);
                        if (!firstError) firstError = err;
                    }
                }

                if (!aiResponseText) throw firstError || new Error('All Gemini models failed.');
            }

            // Parse response
            let jsonText = aiResponseText;
            const jsonMatch = aiResponseText.match(/\[\s*\{[\s\S]*\}\s*\]/) || aiResponseText.match(/\{[\s\S]*"questions"[\s\S]*\}/);
            if (jsonMatch) jsonText = jsonMatch[0];

            let parsed = JSON.parse(jsonText.replace(/```json/g, '').replace(/```/g, '').trim());
            let questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

            return NextResponse.json({
                questions: questions.map((q: any) => ({
                    question: q.question || 'Missing question',
                    options: Array.isArray(q.options) ? q.options : [],
                    correctAnswer: q.correctAnswer || (q.options ? q.options[0] : '')
                }))
            });

        } catch (aiError: any) {
            console.error('AI Error:', aiError);
            let userMessage = 'Failed to generate questions.';
            if (aiError.message?.includes('quota') || aiError.message?.includes('429')) {
                userMessage = 'Gemini quota exceeded. Please use OpenAI instead.';
            }
            return NextResponse.json({ error: userMessage, details: aiError.message }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Request processing error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}
