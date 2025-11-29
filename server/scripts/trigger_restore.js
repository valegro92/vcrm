const fetch = require('node-fetch'); // Assuming node-fetch is available or using global fetch in Node 18+

// If node-fetch is not available, we can try to use the global fetch (Node 18+)
// or require the user to install it. For simplicity, we'll assume global fetch if node-fetch fails.
const myFetch = global.fetch || require('node-fetch');

async function restore() {
    const baseUrl = 'https://vcrm-x1crx.sevalla.app/api';

    console.log('Logging in...');
    try {
        const loginRes = await myFetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', await loginRes.text());
            return;
        }

        const { token } = await loginRes.json();
        console.log('Login successful. Starting restore...');

        const restoreRes = await myFetch(`${baseUrl}/restore-legacy`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (restoreRes.ok) {
            console.log('Restore successful:', await restoreRes.json());
        } else {
            console.error('Restore failed:', await restoreRes.text());
        }
    } catch (error) {
        console.error('Error during restore:', error);
    }
}

restore();
