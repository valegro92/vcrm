// Using native fetch in Node 18+
const myFetch = global.fetch;

if (!myFetch) {
    console.error('Fetch API not found. Please use Node.js 18+');
    process.exit(1);
}

async function check() {
    const url = 'https://vcrm-x1crx.sevalla.app/api/db-test';
    console.log('Checking DB connection...');

    try {
        const res = await myFetch(url);
        const text = await res.text();

        try {
            const json = JSON.parse(text);
            console.log('Status:', res.status);
            console.log('Response:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Response (not JSON):', text);
        }
    } catch (err) {
        console.error('Request failed:', err.message);
    }
}

check();
