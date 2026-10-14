const https = require('https');
const handle = 'justcallmoonn';
const url = `https://www.tiktok.com/@${handle}`;
const options = {
  headers: { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};
https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.length, data.includes('captcha') || data.includes('VerifyYourself')));
});
