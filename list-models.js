const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function listModels() {
    console.log("Loading .env.local...");
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
        console.error("GEMINI_API_KEY not found.");
        return;
    }

    console.log("Listing available models...");
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // We use the basic fetch as the library might not have a direct listModels wrap in all versions, 
        // or to avoid version assumptions.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("No models returned:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();
