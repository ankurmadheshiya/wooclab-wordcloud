import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import OpenAI from 'openai';

// Initialize Groq
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(request: Request) {
    try {
        const { videoUrl, sourceText: manualText } = await request.json();

        let transcriptText = manualText || '';

        if (!videoUrl && !manualText) {
            return NextResponse.json(
                { error: 'Video URL or transcript text is required' },
                { status: 400 }
            );
        }

        if (videoUrl && !manualText) {
            // Extract video ID from URL
            const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;

            if (!videoId) {
                return NextResponse.json(
                    { error: 'Invalid YouTube URL' },
                    { status: 400 }
                );
            }

            console.log(`Fetching transcript for video ID: ${videoId}`);

            // Fetch transcript
            try {
                const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                transcriptText = transcript.map(item => item.text).join(' ');

                if (!transcriptText) {
                    throw new Error('Transcript is empty');
                }
            } catch (error: any) {
                console.error('Error fetching transcript:', error);
                return NextResponse.json(
                    { 
                        error: 'Could not fetch subtitles automatically.', 
                        details: 'Videos with restrictions or no captions fail. Try pasting the transcript manually.',
                        videoId 
                    },
                    { status: 400 }
                );
            }
        }

        // Limit transcript length to avoid token limits (approx 20k chars)
        if (transcriptText.length > 20000) {
            transcriptText = transcriptText.substring(0, 20000) + '...';
        }

        const systemPrompt = `
      Based on the provided content, generate 3 engaging multiple-choice questions suitable for a live audience poll.
      Return ONLY a raw JSON array of 3 question objects.
      Structure:
      [
        {
          "question": "The question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "The correct option text"
        }
      ]
    `;

        const userPrompt = `Content: "${transcriptText}"`;

        try {
            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0].message.content;
            let questions = [];
            try {
                const parsed = JSON.parse(content || '{}');
                questions = parsed.questions || parsed;
                if (!Array.isArray(questions)) {
                    if (questions && typeof questions === 'object') {
                        // Sometimes model returns { "slides": [...] } or similar
                        const values = Object.values(questions);
                        const arr = values.find(v => Array.isArray(v));
                        if (arr) questions = arr;
                        else questions = [questions];
                    } else {
                        questions = [];
                    }
                }
            } catch (e) {
                console.error('Failed to parse AI response:', content);
                throw new Error('Invalid JSON response from AI');
            }

            return NextResponse.json({ questions });
        } catch (aiError: any) {
            console.error('AI API Error:', aiError);
            return NextResponse.json(
                { error: 'AI Generation Failed', details: aiError.message },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
