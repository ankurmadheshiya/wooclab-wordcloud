const http = require('http');

const data = JSON.stringify({
    type: 'WORD_CLOUD',
    question: 'What is your favorite color?',
    order: 0,
    options: [],
    settings: {}
});

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/sessions/cmm7f2s0m0000tt7g0yqwym3b/slides',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
    });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
