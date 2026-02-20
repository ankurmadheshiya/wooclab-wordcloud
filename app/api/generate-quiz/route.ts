import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { videoUrl } = await request.json();

        if (!videoUrl) {
            return NextResponse.json(
                { error: 'Video URL is required' },
                { status: 400 }
            );
        }

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
        let transcriptText = '';
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(videoId);
            transcriptText = transcript.map(item => item.text).join(' ');

            // Limit transcript length to avoid token limits (approx 15k chars for now)
            if (transcriptText.length > 15000) {
                transcriptText = transcriptText.substring(0, 15000) + '...';
            }
        } catch (error) {
            console.error('Error fetching transcript:', error);
            return NextResponse.json(
                { error: 'Could not fetch subtitles for this video. Please ensure the video has closed captions enabled.' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is missing in environment variables');
            return NextResponse.json(
                { error: 'Server configuration error: Missing API Key' },
                { status: 500 }
            );
        }

        // Generate questions using Gemini
        // Using gemini-1.5-flash as it is the current stable model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Based on the following video transcript, generate 3 engaging multiple-choice questions that would be suitable for a live audience poll.
      
      Transcript:
      "${transcriptText}"
      
      Return ONLY a raw JSON array (no markdown code blocks) with the following structure for each question:
      [
        {
          "question": "The question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "The correct option text"
        }
      ]
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Clean up potential markdown code blocks from the response
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            let questions = [];
            try {
                questions = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse Gemini response:', text);
                throw new Error('Invalid JSON response from Gemini');
            }

            return NextResponse.json({ questions });
        } catch (geminiError) {
            console.error('Gemini API Error:', geminiError);
            return NextResponse.json(
                { error: 'Failed to generate questions with AI. Please try again later.', details: geminiError instanceof Error ? geminiError.message : String(geminiError) },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
