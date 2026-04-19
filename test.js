const axios = require('axios');
const key = 'AIzaSyD2MM7y6UOXUdftFdqkSQMupPwM6cBIhAQ';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
axios.post(url, {
  systemInstruction: { parts: [{ text: 'System prompt' }] },
  contents: [{ parts: [{ text: 'User prompt' }] }]
}).then(r => console.log('SUCCESS'))
  .catch(e => console.error(e.response ? JSON.stringify(e.response.data) : e.message));
