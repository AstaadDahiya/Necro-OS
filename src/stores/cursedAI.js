import { defineStore } from 'pinia';
import geminiService from '../utils/geminiService';
import { useWindowManagerStore } from './windowManager';
import { audioService } from '../utils/audioService';

export const useCursedAI = defineStore('cursedAI', {
  state: () => ({
    messages: [],
    isTyping: false,
    nextMessageId: 1
  }),

  getters: {
    allMessages: (state) => state.messages,
    lastMessage: (state) => state.messages[state.messages.length - 1] || null,
    conversationLength: (state) => state.messages.length
  },

  actions: {
    addMessage(role, content, commands = null) {
      const message = {
        id: `msg-${this.nextMessageId++}`,
        role, // 'user' or 'assistant'
        content,
        timestamp: Date.now(),
        commands: commands || []
      };

      this.messages.push(message);
      return message;
    },

    async sendMessage(userMessage) {
      if (!userMessage || !userMessage.trim()) {
        return;
      }

      // Add user message
      this.addMessage('user', userMessage);
      this.isTyping = true;

      try {
        console.log('[CursedAI] Sending message:', userMessage);
        console.log('[CursedAI] API Key present:', !!import.meta.env.VITE_GEMINI_API_KEY);
        
        // Call Gemini API
        const response = await geminiService.chat(userMessage);
        console.log('[CursedAI] Received response:', response);

        // Parse commands from response
        const commands = this.parseCommands(response);

        // Add assistant message
        this.addMessage('assistant', response, commands);

        // Execute any commands found
        if (commands.length > 0) {
          commands.forEach(command => {
            this.executeCommand(command);
          });
        }

        this.isTyping = false;
        return response;
      } catch (error) {
        console.error('[CursedAI] Failed to send message:', error);
        console.error('[CursedAI] Error details:', error.message, error.status);
        
        // Play error sound
        audioService.play('error');
        
        // Add error message with more details
        let errorMessage = "Something went wrong in the void...";
        if (error.status === 401) {
          errorMessage = "My dark powers are locked. The API key is invalid.";
        } else if (error.status === 429) {
          errorMessage = "I'm too cursed right now... try again later. (Rate limit exceeded)";
        } else if (error.status === 503) {
          errorMessage = "The spirits are overwhelmed... Google's servers are overloaded. Try again in a moment.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.addMessage('assistant', errorMessage);
        
        this.isTyping = false;
        throw error;
      }
    },

    async sendMessageStream(userMessage, onChunk) {
      if (!userMessage || !userMessage.trim()) {
        return;
      }

      // Add user message
      this.addMessage('user', userMessage);
      this.isTyping = true;

      try {
        let fullResponse = '';
        
        // Call Gemini API with streaming
        await geminiService.chatStream(userMessage, (chunk) => {
          fullResponse += chunk;
          if (onChunk) {
            onChunk(chunk, fullResponse);
          }
        });

        // Parse commands from complete response
        const commands = this.parseCommands(fullResponse);

        // Add assistant message
        this.addMessage('assistant', fullResponse, commands);

        // Execute any commands found
        if (commands.length > 0) {
          commands.forEach(command => {
            this.executeCommand(command);
          });
        }

        this.isTyping = false;
        return fullResponse;
      } catch (error) {
        console.error('Failed to send message:', error);
        
        // Play error sound
        audioService.play('error');
        
        // Add error message
        const errorMessage = error.message || "Something went wrong in the void...";
        this.addMessage('assistant', errorMessage);
        
        this.isTyping = false;
        throw error;
      }
    },

    parseCommands(text) {
      const commands = [];
      
      // Match pattern: [COMMAND:action:target:params]
      const commandRegex = /\[COMMAND:([^\]]+)\]/g;
      let match;

      while ((match = commandRegex.exec(text)) !== null) {
        const commandStr = match[1];
        const parts = commandStr.split(':');
        
        if (parts.length >= 1) {
          const command = {
            type: parts[0].toLowerCase(),
            target: parts[1] || null,
            params: parts[2] || null
          };
          
          commands.push(command);
        }
      }

      return commands;
    },

    executeCommand(command) {
      const windowManager = useWindowManagerStore();

      try {
        switch (command.type) {
          case 'open':
            if (command.target) {
              windowManager.openWindow(command.target);
            }
            break;

          case 'close':
            if (command.target) {
              windowManager.closeWindow(command.target);
            }
            break;

          case 'closeall':
            // Close all windows
            const allWindows = [...windowManager.openWindows];
            allWindows.forEach(window => {
              windowManager.closeWindow(window.id);
            });
            break;

          case 'delete':
            // This would trigger file deletion
            // Implementation depends on file system store
            console.log('Delete command:', command.target);
            break;

          case 'minimize':
            if (command.target) {
              windowManager.minimizeWindow(command.target);
            }
            break;

          case 'maximize':
            if (command.target) {
              windowManager.maximizeWindow(command.target);
            }
            break;

          default:
            console.warn('Unknown command type:', command.type);
        }
      } catch (error) {
        console.error('Failed to execute command:', command, error);
        // Play error sound for command execution failures
        audioService.play('error');
      }
    },

    clearMessages() {
      this.messages = [];
      this.nextMessageId = 1;
      geminiService.clearContext();
    },

    removeMessage(messageId) {
      const index = this.messages.findIndex(msg => msg.id === messageId);
      if (index !== -1) {
        this.messages.splice(index, 1);
      }
    }
  }
});
