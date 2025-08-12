import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { ConversationMessage } from './conversation';

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
  private readonly maxTokens: number;

  constructor() {
    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey,
      maxRetries: 3,
    });

    const configuredMax = Number(process.env['MAX_COMPLETION_TOKENS'] || 4000);
    this.maxTokens = Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : 4000;
  }

  async generateResponse(prompt: string, requestId: string, messages?: ConversationMessage[]): Promise<AIResponse> {
    const requestLogger = logger.child({ requestId });
    
    try {
      requestLogger.info('Generating AI response', { 
        promptLength: prompt.length,
        model: this.model,
        hasHistory: !!messages && messages.length > 1
      });

      const startTime = Date.now();
      
      // Use conversation history if provided, otherwise start fresh
      const messageHistory = messages || [
        {
          role: 'system' as const,
          content: 'You are a helpful AI assistant in a Discord server. Provide clear, concise, and accurate responses. Use Discord markdown formatting when appropriate.',
          timestamp: Date.now()
        }
      ];

      // Add the current user message
      const allMessages = [
        ...messageHistory,
        {
          role: 'user' as const,
          content: prompt,
          timestamp: Date.now()
        }
      ];

      // Convert to OpenAI format
      const openaiMessages = allMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: openaiMessages,
        max_completion_tokens: this.maxTokens,
      });

      const responseTime = Date.now() - startTime;
      const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

      requestLogger.info('AI response generated successfully', {
        responseTime,
        responseLength: response.length,
        usage: completion.usage,
        messageCount: allMessages.length
      });

      const result: AIResponse = { content: response };
      if (completion.usage) {
        result.usage = {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        };
      }
      return result;

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

  // deepResearch removed per decision to use GPT-5 web search instead

  private buildTranscript(messages: ConversationMessage[] | undefined, prompt: string): string {
    const history = messages || [
      {
        role: 'system' as const,
        content: 'You are a helpful AI assistant in a Discord server. Provide clear, concise, and accurate responses. Use Discord markdown formatting when appropriate.',
        timestamp: Date.now()
      }
    ];

    const lines: string[] = [];
    for (const msg of history) {
      const speaker = msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System';
      lines.push(`${speaker}: ${msg.content}`);
    }
    lines.push(`User: ${prompt}`);
    lines.push('Assistant:');
    return lines.join('\n');
  }

  async generateResponseWithWebSearch(
    prompt: string,
    requestId: string,
    messages?: ConversationMessage[]
  ): Promise<AIResponse> {
    const requestLogger = logger.child({ requestId });
    const country = process.env['DEFAULT_COUNTRY_CODE'] || 'GB';

    try {
      requestLogger.info('Generating AI response with web search', {
        promptLength: prompt.length,
        model: this.model,
        hasHistory: !!messages && messages.length > 1,
        country
      });

      const transcript = this.buildTranscript(messages, prompt);

      const responseAny: any = await (this.client as any).responses.create({
        model: this.model,
        input: transcript,
        text: {
          format: { type: 'text' },
          verbosity: 'medium'
        },
        reasoning: {
          effort: 'medium',
          summary: 'auto'
        },
        tools: [
          {
            type: 'web_search_preview',
            user_location: {
              type: 'approximate',
              country
            },
            search_context_size: 'medium'
          }
        ],
        max_output_tokens: this.maxTokens,
        store: true
      });

      const content: string = responseAny.output_text
        || (responseAny.output?.map((o: any) => o.content?.map((c: any) => c.text?.value).filter(Boolean).join('\n')).filter(Boolean).join('\n'))
        || 'Sorry, I couldn\'t generate a response.';

      const usageRaw = responseAny.usage;
      const result: AIResponse = { content };
      if (usageRaw) {
        const promptTokens = Number(usageRaw.input_tokens ?? usageRaw.prompt_tokens ?? 0);
        const completionTokens = Number(usageRaw.output_tokens ?? usageRaw.completion_tokens ?? 0);
        result.usage = {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        };
      }

      requestLogger.info('AI response with web search generated successfully', {
        responseLength: content.length,
        usage: result.usage
      });

      return result;
    } catch (error) {
      requestLogger.error('Failed to generate AI response with web search', { error });
      throw new Error('Sorry, I couldn\'t process that with web search. Please try again.');
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
