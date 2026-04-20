import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  console.log('API Key Status:', key ? 'Key found (length: ' + key.length + ')' : 'NO KEY FOUND');
  return key;
};

// Helper function to simulate network delay for mock responses
const delay = (ms) => new Promise(res => setTimeout(res, ms));

const generateContent = async (systemInstruction, userPrompt) => {
  const key = getApiKey();
  if (!key) {
    console.error('API Key is missing');
    throw new Error("Missing Key");
  }

  try {
    console.log('Initializing GoogleGenerativeAI with key...');
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(userPrompt);
    console.log('Got response from Gemini API');
    return result.response.text();
  } catch (error) {
    console.error('Full error object:', error);
    
    // Check for Quota or Invalid Key errors specifically
    if (error.message?.includes('API key') || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error("Missing Key");
    }
    
    if (error.message?.includes('Quota') || error.message?.includes('429')) {
      throw new Error("Google AI Free Tier Quota Exceeded. Please try again later or check your Google Cloud Console.");
    }
    
    throw new Error("Failed to connect to Gemini AI. " + (error.message || "Unknown error"));
  }
};

export const studyAI = {
  generateSummary: async (topic) => {
    try {
      return await generateContent(
        'You are an expert study assistant. Provide clear, technical, and high-fidelity summaries. Format using clean Markdown.',
        `Generate a comprehensive study summary for the topic: ${topic}`
      );
    } catch (error) {
      if (error.message === "Missing Key") {
        await delay(2000); 
        return `### Summary: ${topic}\n\n**Note:** This is a demo response. To get AI-powered content:\n\n1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)\n2. Add it to your Vercel environment variables:\n   - Go to your Vercel project settings\n   - Add variable: \`VITE_GEMINI_API_KEY\`\n   - Set it to your API key\n3. Redeploy your application\n\n**Key Concepts of ${topic}:**\n1. First fundamental principle\n2. Important historical context\n3. Modern applications in the real world`;
      }
      console.error('AI Service Error:', error);
      throw error;
    }
  },

  generateQuestions: async (topic) => {
    try {
      return await generateContent(
        'You are an expert study assistant. Generate 5 challenging practice questions with detailed answers. Format using clean Markdown.',
        `Generate practice questions for the topic: ${topic}`
      );
    } catch (error) {
      if (error.message === "Missing Key") {
        await delay(2000);
        return `### Practice Questions: ${topic}\n\n*This is a demo response. Please configure your Gemini API key in Vercel.*\n\n**Q1:** What is the primary concept of ${topic}?\n**A:** The foundational element that drives understanding.\n\n**Q2:** How does ${topic} relate to modern applications?\n**A:** It serves as a critical component in contemporary systems.\n\n**Q3:** When was ${topic} first introduced?\n**A:** In the modern era of technology development.`;
      }
      console.error('AI Service Error:', error);
      throw error;
    }
  },

  generateFlashcards: async (topic) => {
    try {
      return await generateContent(
        'You are an expert study assistant. Create a set of conceptual flashcards. Format them strictly as:\nFront: [Question]\nBack: [Answer]\n\nDo not include any other text.',
        `Generate 5 flashcards for the topic: ${topic}`
      );
    } catch (error) {
      if (error.message === "Missing Key") {
        await delay(2000);
        return `Front: What is ${topic}?\nBack: A fundamental concept in modern learning.\n\nFront: Main Formula of ${topic}\nBack: Core principle = Understanding + Practice\n\nFront: Primary Application\nBack: Effective knowledge retention.\n\nFront: Historical Significance\nBack: Shaped modern educational approaches.`;
      }
      console.error('AI Service Error:', error);
      throw error;
    }
  },

  continueChat: async (contextData, messageHistory, newMessage) => {
    try {
      const key = getApiKey();
      if (!key) throw new Error("Missing Key");

      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are an expert study assistant. The user is asking follow-up questions about the following topic and generated content:\n\nTopic: ${contextData.topic}\n\nOriginal Content: ${contextData.result}`
      });

      const chat = model.startChat({
        history: messageHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))
      });

      const result = await chat.sendMessage(newMessage);
      return result.response.text();
    } catch (error) {
      if (error.message === "Missing Key") {
        await delay(1500);
        return `*Demo Response:* Thank you for your question about ${contextData.topic}. Here is some additional information that might help!\n\nTo enable full AI chat functionality, please configure your Gemini API key in your Vercel project settings.`;
      }
      console.error('AI Chat Error:', error);
      if (error.message?.includes('Quota') || error.message?.includes('429')) {
        throw new Error("Google AI Free Tier Quota Exceeded. Please try again later.");
      }
      throw new Error("Failed to send message: " + (error.message || "Unknown error"));
    }
  }
};

