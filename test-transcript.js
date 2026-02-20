const { YoutubeTranscript } = require('youtube-transcript');

// A known video ID that usually has captions (e.g., a TED talk or popular educational video)
// 'jNQXAC9IVRw' is 'Me at the zoo', might not have captions.
// 'M7fiOboKDWc' is 'Me at the zoo'
// Let's use a Google video: 'CwA1VWP6MME' (Google I/O 2023 in under 10 minutes)
const VIDEO_ID = 'CwA1VWP6MME';

console.log(`Fetching transcript for video: ${VIDEO_ID}...`);

YoutubeTranscript.fetchTranscript(VIDEO_ID)
    .then(transcript => {
        console.log('Success! Found ' + transcript.length + ' lines.');
        console.log('First line:', transcript[0]);
    })
    .catch(err => {
        console.error('Error fetching transcript:', err);
    });
