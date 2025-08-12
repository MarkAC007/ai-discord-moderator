import OpenAI from 'openai';
import { logger } from '../utils/logger';

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIService {
  private client: OpenAI;
  private readonly model: string = 'gpt-5';
  private readonly maxTokens: number = 2000;

  constructor() {
    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey,
      maxRetries: 3,
    });
  }

  async generateResponse(prompt: string, requestId: string): Promise<AIResponse> {
    const requestLogger = logger.child({ requestId });
    
    try {
      requestLogger.info('Generating AI response', { 
        promptLength: prompt.length,
        model: this.model 
      });

      const startTime = Date.now();
      
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant in a Discord server. Provide clear, concise, and accurate responses. Use Discord markdown formatting when appropriate.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: this.maxTokens,
      });

      const responseTime = Date.now() - startTime;
      const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

      requestLogger.info('AI response generated successfully', {
        responseTime,
        responseLength: response.length,
        usage: completion.usage
      });

      return {
        content: response,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        } : undefined
      } as AIResponse;

    } catch (error) {
      requestLogger.error('Failed to generate AI response', { error });
      
      // Handle specific OpenAI errors
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.status === 400) {
          throw new Error('Invalid request. Please check your input.');
        } else if (error.status === 401) {
          throw new Error('Authentication failed. Please check your API key.');
        } else if (error.status === 500) {
          throw new Error('OpenAI service is temporarily unavailable.');
        }
      }

      // Handle content filtering
      if (error instanceof OpenAI.BadRequestError && error.message.includes('content_filter')) {
        throw new Error('Your request was filtered due to content policy violations.');
      }

      throw new Error('Sorry, I couldn\'t process that. Please try again.');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      logger.error('Failed to test OpenAI connection', { error });
      return false;
    }
  }
}
