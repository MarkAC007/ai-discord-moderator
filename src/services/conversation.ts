import { logger } from '../utils/logger';

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  userId: string;
  messages: ConversationMessage[];
  lastActivity: number;
  messageCount: number;
}

export class ConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private readonly maxMessages = 20; // Keep last 20 messages
  private readonly maxAge = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Clean up old conversations every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  getConversation(userId: string): Conversation {
    let conversation = this.conversations.get(userId);
    
    if (!conversation) {
      conversation = {
        userId,
        messages: [{
          role: 'system',
          content: 'You are a helpful AI assistant in a Discord server. Provide clear, concise, and accurate responses. Use Discord markdown formatting when appropriate.',
          timestamp: Date.now()
        }],
        lastActivity: Date.now(),
        messageCount: 0
      };
      this.conversations.set(userId, conversation);
    }

    conversation.lastActivity = Date.now();
    return conversation;
  }

  addMessage(userId: string, role: 'user' | 'assistant', content: string): void {
    const conversation = this.getConversation(userId);
    
    conversation.messages.push({
      role,
      content,
      timestamp: Date.now()
    });
    
    conversation.messageCount++;
    
    // Keep only the last maxMessages messages (excluding system message)
    if (conversation.messages.length > this.maxMessages + 1) {
      const systemMessage = conversation.messages[0];
      if (systemMessage && systemMessage.role === 'system') {
        conversation.messages = [systemMessage, ...conversation.messages.slice(-this.maxMessages)];
      } else {
        // Fallback: just keep the last maxMessages
        conversation.messages = conversation.messages.slice(-this.maxMessages);
      }
    }

    logger.info('Message added to conversation', { 
      userId, 
      role, 
      messageCount: conversation.messageCount,
      totalMessages: conversation.messages.length 
    });
  }

  clearConversation(userId: string): boolean {
    const existed = this.conversations.has(userId);
    this.conversations.delete(userId);
    
    if (existed) {
      logger.info('Conversation cleared', { userId });
    }
    
    return existed;
  }

  getMessages(userId: string): ConversationMessage[] {
    return this.getConversation(userId).messages;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, conversation] of this.conversations.entries()) {
      if (now - conversation.lastActivity > this.maxAge) {
        this.conversations.delete(userId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cleaned up old conversations', { cleanedCount });
    }
  }

  getStats(): { totalConversations: number; totalMessages: number } {
    let totalMessages = 0;
    for (const conversation of this.conversations.values()) {
      totalMessages += conversation.messageCount;
    }

    return {
      totalConversations: this.conversations.size,
      totalMessages
    };
  }
}

export const conversationManager = new ConversationManager();
