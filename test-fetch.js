const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function test() {
    fs.writeFileSync('test_write.txt', 'Start\n');
    let apiKey = "";
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            apiKey = envContent.match(/GEMINI_API_KEY=([^\s]+)/)?.[1]?.replace(/^["']|["']$/g, '') || "";
        }
    } catch (e) { fs.appendFileSync('test_write.txt', 'Env error: ' + e.message + '\n'); }

    if (!apiKey) {
        fs.appendFileSync('test_write.txt', 'No key\n');
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        fs.appendFileSync('test_write.txt', JSON.stringify(data, null, 2));
    } catch (e) {
        fs.appendFileSync('test_write.txt', 'Fetch error: ' + e.message + '\n');
    }
}

test();
