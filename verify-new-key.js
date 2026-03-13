const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function verify() {
    console.log("Starting Verification...");
    let apiKey = "";
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, '');
                    if (key === 'GEMINI_API_KEY') apiKey = value;
                }
            });
        }
    } catch (e) {
        console.error("Error loading .env.local:", e.message);
    }

    if (!apiKey) {
        console.error("❌ API Key not found in .env.local");
        return;
    }

    console.log(`Using Key: ${apiKey.substring(0, 4)}...`);
    const genAI = new GoogleGenerativeAI(apiKey);

    // We'll test the most standard name first
    const modelName = 'gemini-1.5-flash';
    console.log(`Testing model: ${modelName}`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Respond with 'Model Working'");
        const response = await result.response;
        console.log(`✅ SUCCESS: ${response.text()}`);
    } catch (e) {
        console.error(`❌ FAILED with ${modelName}: ${e.message}`);

        console.log("Trying fallback: gemini-1.5-flash-latest");
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
            const result = await model.generateContent("Respond with 'Fallback Working'");
            const response = await result.response;
            console.log(`✅ SUCCESS WITH FALLBACK: ${response.text()}`);
        } catch (err) {
            console.error(`❌ FALLBACK FAILED: ${err.message}`);
        }
    }
}

verify();
