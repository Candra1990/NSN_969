const https = require('https');
const handle = 'justcallmoonn';
const url = `https://www.tiktok.com/api-live/user/room/?uniqueId=${handle}&sourceType=54`;
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
