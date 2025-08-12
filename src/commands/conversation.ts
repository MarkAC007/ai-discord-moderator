import { 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  SlashCommandBuilder 
} from 'discord.js';
import { conversationManager } from '../services/conversation';
import { createRequestLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const data = new SlashCommandBuilder()
  .setName('conversation')
  .setDescription('Manage your conversation with the AI')
  .addSubcommand(subcommand =>
    subcommand
      .setName('clear')
      .setDescription('Clear your conversation history and start fresh')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('info')
      .setDescription('Show information about your current conversation')
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const requestId = uuidv4();
  const userId = interaction.user.id;
  const guildId = interaction.guildId || 'DM';
  const requestLogger = createRequestLogger(requestId, userId, guildId);

  try {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'clear') {
      const existed = conversationManager.clearConversation(userId);
      
      const embed = new EmbedBuilder()
        .setColor(existed ? 0x00FF00 : 0xFFFF00)
        .setTitle('🗑️ Conversation Cleared')
        .setDescription(existed 
          ? 'Your conversation history has been cleared. Start a new conversation with `/ask`!'
          : 'You didn\'t have an active conversation to clear.'
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      
      requestLogger.info('Conversation cleared', { userId, existed });

    } else if (subcommand === 'info') {
      const conversation = conversationManager.getConversation(userId);
      const stats = conversationManager.getStats();
      
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('💬 Conversation Info')
        .addFields(
          {
            name: '📝 Your Messages',
            value: `${conversation.messageCount} messages in this thread`,
            inline: true
          },
          {
            name: '⏰ Last Activity',
            value: `<t:${Math.floor(conversation.lastActivity / 1000)}:R>`,
            inline: true
          },
          {
            name: '🌐 Global Stats',
            value: `${stats.totalConversations} active conversations\n${stats.totalMessages} total messages`,
            inline: false
          }
        )
        .setFooter({ 
          text: `Conversation ID: ${userId}`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      
      requestLogger.info('Conversation info requested', { userId, messageCount: conversation.messageCount });
    }

  } catch (error) {
    requestLogger.error('Conversation command failed', { error });
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Error')
      .setDescription(errorMessage)
      .setTimestamp();

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}
