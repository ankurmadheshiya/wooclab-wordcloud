const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
// const dotenv = require('dotenv'); // Not installed

const LOG_FILE = path.join(__dirname, 'debug_log.txt');

console.log("Script started");
try {
    fs.writeFileSync(LOG_FILE, "Init log file\n");
    console.log("Log file initialized");
} catch (e) {
    console.error("Failed to write log file:", e);
}

function log(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    console.log(message);
    try {
        fs.appendFileSync(LOG_FILE, logLine);
    } catch (e) {
        console.error("Write error:", e);
    }
}

async function runDebug() {
    log("Starting Debug Script...");

    // Load Environment Variables manually
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                    process.env[key] = value;
                }
            });
            log("Loaded .env.local manually");
        } else {
            log("❌ .env.local file NOT found at: " + envPath);
        }
    } catch (e) {
        log("❌ Error loading .env.local: " + e.message);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        log("❌ GEMINI_API_KEY is missing from environment.");
        return;
    }
    log(`API Key present: ${apiKey.substring(0, 4)}... (length: ${apiKey.length})`);

    const modelName = 'gemini-1.5-flash';
    log(`Testing Model: ${modelName}`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        log("Sending simple prompt...");
        const result = await model.generateContent("Say 'Test Successful'");
        const response = await result.response;
        const text = response.text();

        log(`✅ SUCCESS! Response: ${text}`);
    } catch (error) {
        log("❌ FAIL: Gemini API Error occurred.");
        log(`Error Name: ${error.name}`);
        log(`Error Message: ${error.message}`);
        if (error.status) log(`Status: ${error.status}`);
        if (error.statusText) log(`StatusText: ${error.statusText}`);
        if (error.errorDetails) log(`Details: ${JSON.stringify(error.errorDetails)}`);

        // Check for common issues
        if (error.message.includes("API key not valid")) {
            log("-> Hint: Double check your API key in .env.local");
        }
        if (error.message.includes("404")) {
            log("-> Hint: Model name might be wrong or not available to your key/region.");
            // Try fallback
            await tryFallback(genAI, 'gemini-pro');
        }
    }
}

async function tryFallback(genAI, fallbackModel) {
    log(`Attempting fallback model: ${fallbackModel}`);
    try {
        const model = genAI.getGenerativeModel({ model: fallbackModel });
        const result = await model.generateContent("Test");
        const response = await result.response;
        log(`✅ Fallback SUCCESS with ${fallbackModel}: ${response.text()}`);
    } catch (e) {
        log(`❌ Fallback FAILED with ${fallbackModel}: ${e.message}`);
    }
}

runDebug();
