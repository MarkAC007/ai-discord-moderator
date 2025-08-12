import { 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  SlashCommandBuilder 
} from 'discord.js';
import { AIService } from '../services/ai';
import { conversationManager } from '../services/conversation';
import { rateLimiter } from '../utils/rateLimit';
import { createRequestLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const data = new SlashCommandBuilder()
  .setName('ask')
  .setDescription('Ask the AI anything (supports conversation memory)')
  .addStringOption(option =>
    option
      .setName('prompt')
      .setDescription('Your question or prompt')
      .setRequired(true)
      .setMaxLength(2000)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const requestId = uuidv4();
  const userId = interaction.user.id;
  const guildId = interaction.guildId || 'DM';
  const requestLogger = createRequestLogger(requestId, userId, guildId);

  try {
    // Check rate limiting
    if (rateLimiter.isRateLimited(userId)) {
      const timeUntilReset = rateLimiter.getTimeUntilReset(userId);
      const seconds = Math.ceil(timeUntilReset / 1000);
      
      requestLogger.warn('Rate limit exceeded', { userId, timeUntilReset });
      
      await interaction.reply({
        content: `⏰ Please wait ${seconds} seconds before your next request.`,
        ephemeral: true
      });
      return;
    }

    const prompt = interaction.options.getString('prompt', true);
    
    requestLogger.info('Processing ask command', { 
      promptLength: prompt.length,
      userId,
      guildId 
    });

    // Defer reply to handle longer response times
    await interaction.deferReply();

    // Get conversation history
    const conversation = conversationManager.getConversation(userId);
    const messages = conversation.messages;
    
    // Generate AI response with conversation history
    const aiService = new AIService();
    const response = await aiService.generateResponse(prompt, requestId, messages);

    // Add messages to conversation
    conversationManager.addMessage(userId, 'user', prompt);
    conversationManager.addMessage(userId, 'assistant', response.content);

    // Create embed response
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('🤖 AI Response')
      .setDescription(response.content)
      .setFooter({ 
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    // Add conversation info
    embed.addFields({
      name: '💬 Conversation',
      value: `${conversation.messageCount} messages in this thread`,
      inline: true
    });

    // Add usage info if available
    if (response.usage) {
      embed.addFields({
        name: '📊 Usage',
        value: `Tokens: ${response.usage.totalTokens} (${response.usage.promptTokens} + ${response.usage.completionTokens})`,
        inline: true
      });
    }

    // Add rate limit info
    const remainingRequests = rateLimiter.getRemainingRequests(userId);
    embed.addFields({
      name: '⏱️ Rate Limit',
      value: `${remainingRequests} requests remaining`,
      inline: true
    });

    await interaction.editReply({ embeds: [embed] });

    requestLogger.info('Ask command completed successfully', {
      responseLength: response.content.length,
      usage: response.usage,
      conversationLength: messages.length
    });

  } catch (error) {
    requestLogger.error('Ask command failed', { error });
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Error')
      .setDescription(errorMessage)
      .setTimestamp();

    if (interaction.deferred) {
      await interaction.editReply({ embeds: [errorEmbed] });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
}
