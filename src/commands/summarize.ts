import { 
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  ThreadChannel,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { createRequestLogger } from '../utils/logger';
import { rateLimiter } from '../utils/rateLimit';
import { parseRange, SupportedRange } from '../utils/timeRange';
import { fetchMessagesInWindow } from '../utils/fetchChannelMessages';
import { buildCorpus } from '../utils/corpus';
import { chunkText } from '../utils/chunk';
import { AIService } from '../services/ai';
import { ConversationMessage } from '../services/conversation';

export const data = new SlashCommandBuilder()
  .setName('summarize')
  .setDescription('Summarize channel message history over a time window')
  .addStringOption(option =>
    option
      .setName('range')
      .setDescription('Time window to summarize')
      .setRequired(true)
      .addChoices(
        { name: '1 hour', value: '1h' },
        { name: '6 hours', value: '6h' },
        { name: '24 hours', value: '24h' },
        { name: '3 days', value: '3d' },
        { name: '7 days', value: '7d' },
        { name: '30 days', value: '30d' },
      )
  )
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('Channel to summarize (defaults to current)')
      .addChannelTypes(
        ChannelType.GuildText,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
      )
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option
      .setName('include_bots')
      .setDescription('Include bot messages (default: false)')
      .setRequired(false)
  )
  .addIntegerOption(option =>
    option
      .setName('max_messages')
      .setDescription('Maximum messages to scan (100–5000, default: 1000)')
      .setRequired(false)
      .setMinValue(100)
      .setMaxValue(5000)
  )
  .addStringOption(option =>
    option
      .setName('visibility')
      .setDescription('Where to show the result')
      .addChoices(
        { name: 'Ephemeral (default)', value: 'ephemeral' },
        { name: 'Public', value: 'public' },
      )
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const requestId = uuidv4();
  const userId = interaction.user.id;
  const guildId = interaction.guildId || 'DM';
  const requestLogger = createRequestLogger(requestId, userId, guildId);

  try {
    // Basic per-user rate limiting
    if (rateLimiter.isRateLimited(userId)) {
      const timeUntilReset = rateLimiter.getTimeUntilReset(userId);
      const seconds = Math.ceil(timeUntilReset / 1000);
      requestLogger.warn('Rate limit exceeded for summarize', { userId, timeUntilReset });
      await interaction.reply({
        content: `⏰ Please wait ${seconds} seconds before your next request.`,
        ephemeral: true,
      });
      return;
    }

    // Read options
    const range = interaction.options.getString('range', true);
    const channelOpt = interaction.options.getChannel('channel');
    const includeBots = interaction.options.getBoolean('include_bots') ?? false;
    const maxMessages = interaction.options.getInteger('max_messages') ?? 1000;
    let visibility = interaction.options.getString('visibility') ?? 'ephemeral';
    let ephemeral = visibility !== 'public';

    // Public visibility requires Manage Guild permission
    if (!ephemeral) {
      const isAdmin = !!(interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild));
      if (!isAdmin) {
        visibility = 'ephemeral';
        ephemeral = true;
      }
    }

    // Defer while we fetch/process
    await interaction.deferReply({ ephemeral });

    const targetChannel = (channelOpt ?? interaction.channel) as TextChannel | ThreadChannel | null;
    if (!targetChannel || typeof (targetChannel as any).isTextBased !== 'function' || !(targetChannel as any).isTextBased()) {
      await interaction.editReply({ content: 'Please choose a text-based channel or run this in a text channel.' });
      return;
    }

    const window = parseRange(range as SupportedRange);
    const { messages, uniqueAuthorIds } = await fetchMessagesInWindow(targetChannel as any, {
      fromTimestamp: window.from,
      toTimestamp: window.to,
      maxMessages,
      includeBots,
    });

    if (messages.length === 0) {
      await interaction.editReply({ content: `No messages found in the ${window.label}. Try a wider range or different channel.` });
      return;
    }

    const corpusRes = buildCorpus(messages, { maxMessageLength: 800 });
    const chunks = chunkText(corpusRes.corpus, { maxCharsPerChunk: 8000 });

    // Summarize using two-pass approach if needed
    const ai = new AIService();

    const systemPrompt = 'You are an expert summarizer for Discord channel histories. Produce a concise, neutral summary for readers who did not follow the conversation. Structure your output with: short overview paragraph; 3–7 key topics as bullets; optional actions/decisions; brief sentiment/engagement. Avoid sensitive verbatim quotes; prefer paraphrases.';

    const channelName = (targetChannel && 'name' in targetChannel) ? (targetChannel as any).name : '#current';

    const summarizeChunk = async (text: string): Promise<string> => {
      const messagesForAI: ConversationMessage[] = [
        { role: 'system', content: systemPrompt, timestamp: Date.now() },
      ];
      const prompt = `Summarize messages from channel "${channelName}" in the ${window.label}. Total scanned: ${messages.length} messages from ${uniqueAuthorIds.size} participants. Content:\n${text}`;
      const resp = await ai.generateResponse(prompt, requestId, messagesForAI, interaction.guildId);
      return resp.content.trim();
    };

    let finalSummary: string;
    if (chunks.length === 1) {
      finalSummary = await summarizeChunk(chunks[0]!);
    } else {
      const partials: string[] = [];
      for (const c of chunks) {
        const part = await summarizeChunk(c);
        partials.push(part);
      }
      const reductionMessages: ConversationMessage[] = [
        { role: 'system', content: systemPrompt, timestamp: Date.now() },
      ];
      const reductionPrompt = `Combine these partial summaries into a single concise summary with the same structure. Do not exceed 700 words.\n\n${partials.map((p, i) => `Part ${i + 1}:\n${p}`).join('\n\n')}`;
      const reduced = await ai.generateResponse(reductionPrompt, requestId, reductionMessages, interaction.guildId);
      finalSummary = reduced.content.trim();
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`Channel Summary (${window.label})`)
      .setDescription(finalSummary)
      .addFields(
        {
          name: '📊 Stats',
          value: `Messages scanned: ${messages.length}\nParticipants: ${uniqueAuthorIds.size}\nChunks: ${chunks.length}`,
          inline: true,
        },
        {
          name: '⚙️ Options',
          value: `Include bots: ${includeBots ? 'yes' : 'no'}\nMax messages: ${maxMessages}\nVisibility: ${ephemeral ? 'ephemeral' : 'public'}`,
          inline: true,
        },
      )
      .setFooter({ text: `Channel: ${channelName}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    requestLogger.info('Summarize collected messages', {
      range,
      label: window.label,
      collected: messages.length,
      participants: uniqueAuthorIds.size,
      chunks: chunks.length,
      truncated: corpusRes.truncatedCount,
    });
  } catch (error) {
    requestLogger.error('Summarize command scaffold failed', { error });
    if (interaction.deferred) {
      await interaction.editReply({ content: '❌ Failed to run summarize scaffold. Please try again.' });
    } else {
      await interaction.reply({ content: '❌ Failed to run summarize scaffold. Please try again.', ephemeral: true });
    }
  }
}


