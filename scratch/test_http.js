const http = require('http');

const urls = [
  'http://localhost:3031/',
  'http://localhost:3031/create-room',
  'http://localhost:3031/voting-results',
  'http://localhost:3031/dashboard',
  'http://localhost:3031/history',
  'http://localhost:3031/landing'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      console.log(`[GET] ${url} -> Status: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    }).on('error', (err) => {
      console.log(`[GET] ${url} -> ERROR: ${err.message}`);
      resolve(false);
    });
  });
}

async function main() {
  console.log('Testing ALL Next.js routes E2E via local HTTP request...');
  let allPass = true;
  for (const url of urls) {
    const ok = await checkUrl(url);
    if (!ok) allPass = false;
  }
  if (allPass) {
    console.log('=== SEMUA ROUTE UTAMA SUKSES (200 OK) ===');
  } else {
    console.log('=== ADA ROUTE YANG GAGAL / ERROR ===');
    process.exit(1);
  }
}

main().catch(console.error);
