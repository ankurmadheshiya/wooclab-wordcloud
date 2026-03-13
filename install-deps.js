const { execSync } = require('child_process');
try {
  console.log('--- Starting installation ---');
  const output = execSync('npm install --save pdf-parse officeparser', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('--- SUCCESS ---');
  console.log(output);
} catch (e) {
  console.log('--- FAILED ---');
  if (e.stdout) console.log('STDOUT:', e.stdout);
  if (e.stderr) console.log('STDERR:', e.stderr);
  console.log('Message:', e.message);
}
