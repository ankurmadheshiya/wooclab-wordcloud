const fs = require('fs');
const { execSync } = require('child_process');
try {
  const output = execSync('npm install --save --legacy-peer-deps lucide-react framer-motion', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('install-output.txt', output);
} catch (e) {
  let errStr = e.message + '\n';
  if (e.stdout) errStr += e.stdout + '\n';
  if (e.stderr) errStr += e.stderr + '\n';
  fs.writeFileSync('install-output.txt', errStr);
}
