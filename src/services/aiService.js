import Groq from 'groq-sdk';

const getApiKey = () => {
  // Check for Groq key first, fallback to old key name just in case
  const key = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
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
    console.log('Initializing Groq SDK with key...');
    const groq = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });

    console.log('Sending request to Groq API...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      model: "llama3-8b-8192",
    });
    
    console.log('Got response from Groq API');
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.warn('API Error, falling back to mock AI:', error.message);
    throw new Error("Missing Key");
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
        return `### Summary: ${topic}\n\n**Introduction**\n${topic} is a foundational subject that encompasses a variety of core principles and methodologies essential for deep understanding in this field. It forms the basis for advanced applications and theoretical frameworks.\n\n**Key Concepts:**\n1. **Core Principles:** The fundamental rules governing ${topic}.\n2. **Methodologies:** The standard practices and techniques used by professionals.\n3. **Modern Applications:** How ${topic} is utilized in real-world, contemporary scenarios.\n\n*Note: This is an automatically generated general overview.*`;
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
        return `### Practice Questions: ${topic}\n\nTest your knowledge with these foundational questions:\n\n**Q1:** What is the primary definition and scope of ${topic}?\n**A:** It is the comprehensive study and application of core principles within its specific domain.\n\n**Q2:** How does ${topic} integrate with modern technological systems?\n**A:** It serves as a critical infrastructure component, enabling advanced capabilities and efficiency.\n\n**Q3:** What are the most common challenges faced when implementing concepts from ${topic}?\n**A:** Typical challenges include scalability, resource management, and maintaining theoretical accuracy in practical scenarios.`;
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
        return `Front: Core Definition of ${topic}\nBack: The essential framework and principles that define this subject area.\n\nFront: Primary Application\nBack: Used extensively in modern industry for structural problem solving.\n\nFront: Key Terminology\nBack: The specific vocabulary required to understand advanced texts in this field.\n\nFront: Historical Context\nBack: Developed over decades through rigorous peer-reviewed research.`;
      }
      console.error('AI Service Error:', error);
      throw error;
    }
  },

  continueChat: async (contextData, messageHistory, newMessage) => {
    try {
      const key = getApiKey();
      if (!key) throw new Error("Missing Key");

      const groq = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
      
      const messages = [
        { role: "system", content: `You are an expert study assistant. The user is asking follow-up questions about the following topic and generated content:\n\nTopic: ${contextData.topic}\n\nOriginal Content: ${contextData.result}` },
        ...messageHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: newMessage }
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192",
      });

      return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
      console.warn('API Chat Error, falling back to mock AI:', error.message);
      await delay(1500);
      return `Thank you for your question about ${contextData.topic}. Based on standard principles, the answer requires a deep dive into the foundational concepts we discussed earlier. Is there a specific part of the summary you would like me to clarify further?`;
    }
  }
};
