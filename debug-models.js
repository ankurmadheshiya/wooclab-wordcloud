const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function debugModels() {
    let log = "DEBUG MODELS LOG\n";
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
    } catch (e) { log += "Env error: " + e.message + "\n"; }

    if (!apiKey) {
        log += "No API key found.\n";
        fs.writeFileSync('debug_models_results.txt', log);
        return;
    }

    log += "Key starts with: " + apiKey.substring(0, 4) + "\n";
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro'];

    for (const m of models) {
        log += `Testing ${m}...\n`;
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("hi");
            const response = await result.response;
            log += `✅ ${m} SUCCESS: ${response.text().substring(0, 10).replace(/\n/g, ' ')}\n`;
        } catch (e) {
            log += `❌ ${m} FAILED: ${e.message}\n`;
            if (e.status) log += `Status: ${e.status}\n`;
            if (e.statusText) log += `StatusText: ${e.statusText}\n`;
        }
    }

    fs.writeFileSync('debug_models_results.txt', log);
    console.log("Done");
}

debugModels();
