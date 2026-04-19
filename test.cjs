const { GoogleGenerativeAI } = require('@google/generative-ai');
const key = 'AIzaSyD2MM7y6UOXUdftFdqkSQMupPwM6cBIhAQ';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log("AVAILABLE MODELS:", data.models.map(m => m.name).join(', '));
    } else {
      console.log("RESPONSE:", JSON.stringify(data));
    }
  })
  .catch(err => console.error("ERROR", err));
