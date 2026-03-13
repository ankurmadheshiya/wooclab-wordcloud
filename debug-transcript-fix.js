const { YoutubeTranscript } = require('youtube-transcript');

async function debug() {
    const videoId = 'CwA1VWP6MME'; // Google I/O 2023 - should have captions
    console.log(`Testing transcript for: ${videoId}`);
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log(`Success! Found ${transcript.length} segments.`);
    } catch (error) {
        console.error('FAILED to fetch transcript:');
        console.error(error);
    }
}

debug();
