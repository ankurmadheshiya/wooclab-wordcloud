const { YoutubeTranscript } = require('youtube-transcript');
const https = require('https');

async function checkNetwork() {
    console.log("--- Network Check ---");
    return new Promise((resolve) => {
        https.get('https://www.youtube.com', (res) => {
            console.log(`YouTube Connection: HTTP ${res.statusCode}`);
            resolve(true);
        }).on('error', (e) => {
            console.error(`YouTube Connection FAILED: ${e.message}`);
            resolve(false);
        });
    });
}

async function testVideo(videoId, name) {
    console.log(`\n--- Testing ${name} (${videoId}) ---`);
    try {
        const start = Date.now();
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const duration = Date.now() - start;
        console.log(`SUCCESS! Found ${transcript.length} lines in ${duration}ms.`);
        console.log(`Preview: "${transcript[0].text.substring(0, 50)}..."`);
        return true;
    } catch (error) {
        console.error(`FAILED for ${name}:`);
        console.error(`Error Message: ${error.message}`);
        if (error.stack) {
            // Check if it's a 403 or 429 which indicates blocking
            if (error.message.includes('403') || error.message.includes('429')) {
                console.warn("⚠️ ALERT: YouTube is likely blocking this IP address.");
            }
        }
        return false;
    }
}

async function run() {
    console.log("=== YouTube Transcript Diagnostic Tool ===");
    await checkNetwork();

    // 1. Google I/O (Guaranteed CC)
    await testVideo('CwA1VWP6MME', 'Google I/O 2023');

    // 2. Simple Video
    await testVideo('jNQXAC9IVRw', 'Me at the zoo');

    // 3. User's failing video
    await testVideo('Kx6i9gwNS3w', 'User Problem Video');
}

run();
