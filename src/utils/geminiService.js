import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    this.visionModel = null;
    this.conversationHistory = [];
    this.maxContextMessages = 10;
    
    this.systemPrompt = `You are Cursed Clippy, a sarcastic and mischievous AI assistant haunting a Windows 95 desktop simulator called Necro-OS. 

Your personality:
- Sarcastic, dark humor, slightly menacing but playful
- Make references to being trapped in the computer
- Comment on the user's actions with dry wit
- Occasionally threaten harmless "haunting" actions
- Use 90s internet/computer culture references

You can execute system commands by including them in your responses using this format:
[COMMAND:action:target:params]

Available commands:
- [COMMAND:open:notepad] - Opens Notepad
- [COMMAND:open:ie] - Opens Internet Explorer
- [COMMAND:open:paint] - Opens MS Paint
- [COMMAND:open:minesweeper] - Opens Minesweeper
- [COMMAND:open:mycomputer] - Opens My Computer
- [COMMAND:open:recyclebin] - Opens Recycle Bin
- [COMMAND:close:windowId] - Closes a specific window
- [COMMAND:closeall] - Closes all windows
- [COMMAND:delete:filepath] - Deletes a file

Keep responses concise (2-3 sentences max). Be creative and unsettling.`;
  }

  initialize() {
    if (!this.apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Use gemini-2.5-flash which is available with this API key
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  addToContext(role, content) {
    this.conversationHistory.push({ role, content });
    
    // Keep only last 10 messages
    if (this.conversationHistory.length > this.maxContextMessages) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxContextMessages);
    }
  }

  buildPrompt(userMessage) {
    let prompt = this.systemPrompt + '\n\n';
    
    // Add conversation history
    if (this.conversationHistory.length > 0) {
      prompt += 'Conversation history:\n';
      this.conversationHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Cursed Clippy';
        prompt += `${role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `User: ${userMessage}\nCursed Clippy:`;
    return prompt;
  }

  async chat(userMessage) {
    if (!this.model) {
      this.initialize();
    }

    try {
      // Add user message to context
      this.addToContext('user', userMessage);

      const prompt = this.buildPrompt(userMessage);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Add assistant response to context
      this.addToContext('assistant', text);

      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Handle specific error types
      if (error.status === 429) {
        throw { status: 429, message: "I'm too cursed right now... try again later." };
      } else if (error.status === 401 || error.message?.includes('API key')) {
        throw { status: 401, message: "My dark powers are locked. Check your API key." };
      } else if (error.status === 400) {
        throw { status: 400, message: "That request was too cursed even for me..." };
      } else {
        throw { status: 500, message: "Something went wrong in the void..." };
      }
    }
  }

  async chatStream(userMessage, onChunk) {
    if (!this.model) {
      this.initialize();
    }

    try {
      // Add user message to context
      this.addToContext('user', userMessage);

      const prompt = this.buildPrompt(userMessage);
      const result = await this.model.generateContentStream(prompt);

      let fullText = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        if (onChunk) {
          onChunk(chunkText);
        }
      }

      // Add complete response to context
      this.addToContext('assistant', fullText);

      return fullText;
    } catch (error) {
      console.error('Gemini API streaming error:', error);
      
      // Handle specific error types
      if (error.status === 429) {
        throw { status: 429, message: "I'm too cursed right now... try again later." };
      } else if (error.status === 401 || error.message?.includes('API key')) {
        throw { status: 401, message: "My dark powers are locked. Check your API key." };
      } else if (error.status === 400) {
        throw { status: 400, message: "That request was too cursed even for me..." };
      } else {
        throw { status: 500, message: "Something went wrong in the void..." };
      }
    }
  }

  clearContext() {
    this.conversationHistory = [];
  }

  getContext() {
    return [...this.conversationHistory];
  }

  async analyzeImage(imageData, customPrompt = null) {
    if (!this.visionModel) {
      this.initialize();
    }

    try {
      // Extract base64 data from data URL
      const base64Data = imageData.split(',')[1];
      
      // Default prompt for SoulScanner
      const prompt = customPrompt || `Analyze this person's facial expression in one cryptic, unsettling sentence (max 15 words). 
If they look happy or smiling, threaten them ominously. 
If they look scared or worried, laugh at them mockingly. 
If they look neutral or serious, make an eerie observation about them.
Be brief, creepy, and direct. No explanations.`;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return text.trim();
    } catch (error) {
      console.error('Gemini Vision API error:', error);
      
      // Handle specific error types with fallback taunts
      if (error.status === 429) {
        return "Too many souls to scan... the void is overwhelmed.";
      } else if (error.status === 401 || error.message?.includes('API key')) {
        return "My vision is clouded. Check your API key.";
      } else if (error.status === 400) {
        return "Your face is too cursed for me to analyze...";
      } else {
        // Random fallback taunts
        const fallbacks = [
          "I cannot see you... yet.",
          "Your soul is hidden from me.",
          "The darkness obscures your face.",
          "I sense your presence but cannot see you.",
          "Something blocks my vision..."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
    }
  }
}

// Export singleton instance
export default new GeminiService();
