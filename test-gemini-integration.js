const { GoogleGenerativeAI } = require("@google/generative-ai");
const { YoutubeTranscript } = require("youtube-transcript");

async function runTest() {
    console.log("Starting integration test...");

    // 1. Check API Key
    const apiKey = "AIzaSyC6bT8yyPdd8cbrkD3XqW4vNU_dRnLC5XA";
    if (!apiKey) {
        console.error("❌ ERROR: API Key is missing");
        return;
    }
    console.log("✅ API Key configured.");

    // 2. List Available Models
    console.log("Listing available models...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models:");
            let foundSupported = false;
            data.models.forEach(m => {
                // Check if it supports generateContent
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(` - ${m.name.replace('models/', '')}`);
                    foundSupported = true;
                }
            });

            if (!foundSupported) {
                console.warn("⚠️ No models found that support 'generateContent'.");
            }
        } else {
            console.log("❌ Could not list models:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("❌ ERROR listing models:", error.message);
    }
}

runTest();
