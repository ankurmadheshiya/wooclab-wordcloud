const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function finalVerify() {
    let output = "FINAL VERIFICATION LOG\n";
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
    } catch (e) { output += "Error loading env: " + e.message + "\n"; }

    if (!apiKey) {
        output += "No API key found.\n";
        fs.writeFileSync('final_test_results.txt', output);
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ['gemini-1.5-flash-latest', 'gemini-1.5-flash'];

    for (const m of models) {
        try {
            output += `Testing ${m}...\n`;
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Test");
            const response = await result.response;
            output += `✅ ${m} OK: ${response.text().substring(0, 10)}...\n`;
            break;
        } catch (e) {
            output += `❌ ${m} FAILED: ${e.message}\n`;
        }
    }

    fs.writeFileSync('final_test_results.txt', output);
    console.log("Results written to final_test_results.txt");
}

finalVerify();
