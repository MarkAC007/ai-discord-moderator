import { 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  SlashCommandBuilder 
} from 'discord.js';
import { createRequestLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show available commands and usage');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const requestId = uuidv4();
  const userId = interaction.user.id;
  const guildId = interaction.guildId || 'DM';
  const requestLogger = createRequestLogger(requestId, userId, guildId);

  try {
    requestLogger.info('Processing help command', { userId, guildId });

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🤖 Discord AI Bot Help')
      .setDescription('Here are the available commands:')
      .addFields(
        {
          name: '❓ `/ask`',
          value: 'Ask the AI anything (supports conversation memory)\n**Usage:** `/ask prompt: your question here`\n**Example:** `/ask prompt: What is the capital of France?`\n**Features:** Remembers previous messages in your conversation',
          inline: false
        },
        {
          name: '💬 `/conversation`',
          value: 'Manage your conversation with the AI\n**Subcommands:**\n• `/conversation clear` - Clear your conversation history\n• `/conversation info` - Show conversation statistics',
          inline: false
        },
        {
          name: '❓ `/help`',
          value: 'Show this help message\n**Usage:** `/help`',
          inline: false
        },
        {
          name: '🏓 `/ping`',
          value: 'Check bot responsiveness and latency\n**Usage:** `/ping`',
          inline: false
        }
      )
      .addFields({
        name: '📋 Rate Limits',
        value: '• 10 requests per user per minute\n• Maximum 2000 characters per question',
        inline: false
      })
      .addFields({
        name: '💬 Conversation Features',
        value: '• **Memory**: Each user has their own conversation thread\n• **Context**: AI remembers previous messages in your conversation\n• **Auto-cleanup**: Conversations expire after 30 minutes of inactivity\n• **Smart truncation**: Keeps last 20 messages to stay within limits',
        inline: false
      })
      .addFields({
        name: '🔧 Technical Info',
        value: '• Model: GPT-5\n• Response time: < 8 seconds (median)\n• Max response length: 2000 tokens\n• Conversation memory: Last 20 messages',
        inline: false
      })
      .setFooter({ 
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    requestLogger.info('Help command completed successfully');

  } catch (error) {
    requestLogger.error('Help command failed', { error });
    
    await interaction.reply({
      content: '❌ An error occurred while showing help. Please try again.',
      ephemeral: true
    });
  }
}
