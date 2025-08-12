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
          value: 'Ask the AI anything\n**Usage:** `/ask prompt: your question here`\n**Example:** `/ask prompt: What is the capital of France?`',
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
        name: '🔧 Technical Info',
        value: '• Model: GPT-5\n• Response time: < 8 seconds (median)\n• Max response length: 2000 tokens',
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
