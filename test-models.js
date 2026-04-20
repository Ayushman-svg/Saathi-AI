const fetch = require('axios');

(async () => {
    try {
        const key = process.env.VITE_GEMINI_API_KEY || 'AIzaSyD2MM7y6UOXUdftFdqkSQMupPwM6cBIhAQ';
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        console.log('Fetching models...');
        const response = await fetch.get(url);
        
        console.log('Available Models:');
        response.data.models.forEach(model => {
            console.log(`- ${model.name}`);
            if (model.name.includes('gemini')) {
                console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
            }
        });
    } catch (e) {
        console.error('Error fetching models:', e.response ? e.response.data : e.message);
    }
})();
