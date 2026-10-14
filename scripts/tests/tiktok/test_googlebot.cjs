const https = require('https');
const handle = 'justcallmoonn';
const url = `https://www.tiktok.com/@${handle}/live`;
const options = {
  headers: { 
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  }
};
https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.length, data.includes('captcha') || data.includes('VerifyYourself')));
});
