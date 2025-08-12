import { 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  SlashCommandBuilder 
} from 'discord.js';
import { createRequestLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check bot responsiveness and latency');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const requestId = uuidv4();
  const userId = interaction.user.id;
  const guildId = interaction.guildId || 'DM';
  const requestLogger = createRequestLogger(requestId, userId, guildId);

  try {
    const startTime = Date.now();
    
    requestLogger.info('Processing ping command', { userId, guildId });

    // Calculate latency
    const latency = Date.now() - startTime;
    const wsLatency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🏓 Pong!')
      .addFields(
        {
          name: '📡 Bot Latency',
          value: `${latency}ms`,
          inline: true
        },
        {
          name: '🌐 Discord API Latency',
          value: `${wsLatency}ms`,
          inline: true
        }
      )
      .addFields({
        name: '📊 Status',
        value: latency < 100 ? '🟢 Excellent' : latency < 300 ? '🟡 Good' : '🔴 Poor',
        inline: true
      })
      .setFooter({ 
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    requestLogger.info('Ping command completed successfully', { 
      botLatency: latency,
      wsLatency 
    });

  } catch (error) {
    requestLogger.error('Ping command failed', { error });
    
    await interaction.reply({
      content: '❌ An error occurred while checking ping. Please try again.',
      ephemeral: true
    });
  }
}
