import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY;
};

// Helper function to simulate network delay for mock responses
const delay = (ms) => new Promise(res => setTimeout(res, ms));

const generateContent = async (systemInstruction, userPrompt) => {
  const key = getApiKey();
  if (!key) throw new Error("Missing Key");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: systemInstruction
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
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
        return `### Mock Summary: ${topic}\n\nSince you don't have a Gemini API key configured yet, this is a placeholder response.\n\n**Key Concepts:**\n1. First fundamental principle of ${topic}.\n2. Important historical context.\n3. Modern applications in the real world.\n\n*To get real AI responses, get a free Gemini API key from Google AI Studio and add \`VITE_GEMINI_API_KEY="your-key"\` to your .env file.*`;
      }
      console.error('AI Service Error:', error);
      throw new Error('Failed to connect to Gemini AI service. Check if your API key is valid.');
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
        return `### Mock Quiz: ${topic}\n\n**Q1:** What is the primary function of ${topic}?\n**A:** It serves as a foundational element for mock data.\n\n**Q2:** When was ${topic} first conceptualized?\n**A:** In the modern era of web development.\n\n*Add your Gemini API key to see real questions!*`;
      }
      console.error('AI Service Error:', error);
      throw new Error('Failed to connect to Gemini AI service. Check if your API key is valid.');
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
        return `Front: Core Definition of ${topic}\nBack: The essential meaning and purpose.\n\nFront: Main Formula / Concept\nBack: E = mc^2 (Mock example)\n\nFront: Primary Use Case\nBack: Passing data effectively.`;
      }
      console.error('AI Service Error:', error);
      throw new Error('Failed to connect to Gemini AI service. Check if your API key is valid.');
    }
  },

  continueChat: async (contextData, messageHistory, newMessage) => {
    try {
      const key = getApiKey();
      if (!key) throw new Error("Missing Key");

      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
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
        return `*Mock Chat Response:* Here is some more information about your question regarding ${contextData.topic}!`;
      }
      console.error('AI Chat Error:', error);
      throw new Error('Failed to send message.');
    }
  }
};
