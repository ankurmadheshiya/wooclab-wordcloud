
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Manually load .env.local because dotenv doesn't do it automatically for file names other than .env
try {
    const envConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '.env.local')));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.error("Error loading .env.local:", e.message);
}

console.log("Starting Gemini Model Test...");
console.log("API Key loaded:", process.env.GEMINI_API_KEY ? "Yes (starts with " + process.env.GEMINI_API_KEY.substring(0, 4) + ")" : "No");

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log(`✅ Success with ${modelName}:`, response.text());
        return true;
    } catch (error) {
        console.error(`❌ Failed with ${modelName}:`, error.message);
        return false;
    }
}

async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is missing in .env.local");
        return;
    }

    // prioritizing the fix verification
    console.log("Attempting gemini-1.5-flash (Target Fix)...");
    const v15Result = await testModel("gemini-1.5-flash");

    if (!v15Result) {
        console.log("Target fix failed. Trying fallback to gemini-pro...");
        await testModel("gemini-pro");
    }
    console.log("Test finished.");
}

main();
