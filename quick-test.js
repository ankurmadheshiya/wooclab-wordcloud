const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function testApiKey() {
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
    } catch (e) { }

    if (!apiKey) {
        console.log("No API Key");
        return;
    }

    console.log(`Key starts with: ${apiKey.substring(0, 4)}`);
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];

    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const response = await result.response;
            console.log(`✅ ${modelName} works: ${response.text().substring(0, 20)}...`);
        } catch (e) {
            console.log(`❌ ${modelName} failed: ${e.message}`);
        }
    }
}

testApiKey();
