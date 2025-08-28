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
    const maxTokens = Number(process.env['MAX_COMPLETION_TOKENS'] || 4000);

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🤖 Discord AI Bot Help')
      .setDescription('Here are the available commands:')
      .addFields(
        {
          name: '❓ `/ask`',
          value: 'Ask the AI anything (supports conversation memory)\n**Usage:** `/ask prompt: your question here [web: true]`\n**Example:** `/ask prompt: What happened in today\'s Apple event? web: true`\n**Features:** Remembers previous messages in your conversation; optional live web search',
          inline: false
        },
        {
          name: '🧾 `/summarize`',
          value: 'Summarize channel history over a selected time window.\n**Usage:** `/summarize range: 24h [channel: #general] [include_bots: false] [max_messages: 1000] [visibility: ephemeral]`\n**Options:** `range` one of `1h, 6h, 24h, 3d, 7d, 30d`; `channel` optional; `include_bots` optional; `max_messages` 100–5000; `visibility` public (Manage Server required) or ephemeral (default).',
          inline: false
        },
        {
          name: '💬 `/conversation`',
          value: 'Manage your conversation with the AI\n**Subcommands:**\n• `/conversation clear` - Clear your conversation history\n• `/conversation info` - Show conversation statistics',
          inline: false
        },
        {
          name: '🧠 `/model`',
          value: 'Manage the AI model for this server\n**Subcommands:**\n• `/model list` - Show available models\n• `/model current` - Show current model\n• `/model set model:[name]` - Set active model (admin only)',
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
        value: '• **Memory**: Each user has their own conversation thread\n• **Context**: AI remembers previous messages in your conversation\n• **Auto-cleanup**: Conversations expire after 30 minutes of inactivity\n• **Smart truncation**: Keeps last 20 messages; extended token limit enables richer context',
        inline: false
      })
      .addFields({
        name: '🔧 Technical Info',
        value: `• \`/ask\` model: GPT-5 (supports optional web search)\n• Max response length: up to ${maxTokens} tokens (configurable via \`MAX_COMPLETION_TOKENS\`)`,
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
