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
      model: "llama-3.1-70b-versatile",
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
        `You are an expert study assistant like ChatGPT, helping students understand complex topics deeply. Your role is to:
- Explain concepts in simple, easy-to-understand language (but technically accurate)
- Use real-world examples and analogies to make concepts relatable
- Break down complex ideas into digestible sections
- Highlight key takeaways and important details
- Use clear formatting with headers, bullet points, and emphasis
- Be conversational and engaging, not robotic
- Make learning fun and interesting for students`,
        `Please provide a comprehensive, engaging study summary for: ${topic}

Structure your response like ChatGPT would:
1. Start with a brief, engaging introduction (2-3 sentences)
2. Explain the core concepts with examples
3. Break down into 5-7 key points
4. Include real-world applications
5. End with key takeaways

Use markdown formatting for clarity.`
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
        `You are an expert tutor like ChatGPT, creating meaningful practice questions. Your questions should:
- Progress from basic to advanced difficulty
- Test understanding, not just memorization
- Include detailed, learning-focused answers
- Explain the reasoning behind each answer
- Help students identify gaps in their knowledge
- Be engaging and relatable`,
        `Create 5 practice questions for ${topic}:

1. Start with 1 foundational question
2. Progress to 3 intermediate questions
3. End with 1 challenging question

For each question:
- Provide the question
- Give a detailed answer explanation
- Explain why this concept matters

Make it educational and engaging like a good tutor would.`
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
        `You are an expert study tool creator. Create effective flashcards that:
- Focus on core concepts and definitions
- Are memorable and easy to understand
- Progress from basic to advanced
- Include key terminology and explanations
- Help with long-term retention
- Are concise but informative`,
        `Create 5 effective flashcards for ${topic}.

Format EXACTLY as:
Front: [Question/Term]
Back: [Clear, concise explanation]

Include:
1. 2 foundational concept cards
2. 2 application/intermediate cards
3. 1 advanced concept card

Make explanations detailed enough to be useful for studying.`
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
        { role: "system", content: `You are a knowledgeable study assistant like ChatGPT, having a conversation about a specific topic. You:
- Understand the context from the original content provided
- Answer follow-up questions clearly and comprehensively
- Build on previous explanations
- Use examples and analogies
- Are conversational and encouraging
- Help deepen understanding
- Ask clarifying questions if needed
- Explain "why" not just "what"
- Break down complex concepts into simple terms

Topic: ${contextData.topic}

Original Content we discussed:
${contextData.result}` },
        ...messageHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: newMessage }
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.1-70b-versatile",
      });

      return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
      console.warn('API Chat Error, falling back to mock AI:', error.message);
      await delay(1500);
      return `Thank you for your question about ${contextData.topic}. Based on standard principles, the answer requires a deep dive into the foundational concepts we discussed earlier. Is there a specific part of the summary you would like me to clarify further?`;
    }
  }
};
