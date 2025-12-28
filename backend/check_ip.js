const https = require('https');

console.log('Checking public IP...');

https.get('https://api.ipify.org?format=json', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const ip = JSON.parse(data).ip;
            console.log('==================================================');
            console.log('Your Public IP is:', ip);
            console.log('Please add this IP to your MongoDB Atlas Network Access whitelist.');
            console.log('==================================================');
        } catch (e) {
            console.error('Error parsing IP response:', e);
        }
    });
}).on('error', (e) => {
    console.error('Error fetching IP:', e);
});
