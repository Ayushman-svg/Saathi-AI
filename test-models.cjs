const fetch = require('axios');
const fs = require('fs');

(async () => {
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const match = envContent.match(/VITE_GEMINI_API_KEY="([^"]+)"/);
        if (!match) throw new Error('Key not found in .env');
        const key = match[1];

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        console.log('Fetching models...');
        const response = await fetch.get(url);
        
        console.log('Success! Available Models:', response.data.models.map(m => m.name).slice(0, 3).join(', ') + '...');
    } catch (e) {
        console.error('Error fetching models:', e.response ? e.response.data : e.message);
    }
})();
