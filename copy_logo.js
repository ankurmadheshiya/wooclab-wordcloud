const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\ankur\\.gemini\\antigravity\\brain\\1c2b9789-13e9-4e45-afe8-6e7e9351f7a3\\wordcloud_logo_modern_1773858806525.png";
const dest = path.join(__dirname, 'public', 'logo.png');

console.log("Source: " + src);
console.log("Destination: " + dest);

try {
    if (!fs.existsSync(src)) {
        throw new Error("Source file does not exist: " + src);
    }
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log("Success: Logo copied successfully!");
} catch (err) {
    console.error("Error: " + err.message);
    process.exit(1);
}
