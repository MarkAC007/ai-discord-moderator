import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { modelManager, SupportedModel } from '../services/modelManager';
import { createRequestLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const data = new SlashCommandBuilder()
  .setName('model')
  .setDescription('Manage the AI model for this server')
  .addSubcommand(sub =>
    sub
      .setName('list')
      .setDescription('List available models')
  )
  .addSubcommand(sub =>
    sub
      .setName('current')
      .setDescription('Show the current model for this server')
  )
  .addSubcommand(sub =>
    sub
      .setName('set')
      .setDescription('Set the active model for this server (admin only)')
      .addStringOption(opt =>
        opt
          .setName('model')
          .setDescription('Model to use')
          .setRequired(true)
          .addChoices(
            { name: 'gpt-5', value: 'gpt-5' },
            { name: 'gpt-5-mini', value: 'gpt-5-mini' },
            { name: 'gpt-5-nano', value: 'gpt-5-nano' },
          )
      )
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const requestId = uuidv4();
  const userId = interaction.user.id;
  const guildId = interaction.guildId || 'DM';
  const requestLogger = createRequestLogger(requestId, userId, guildId);

  try {
    const sub = interaction.options.getSubcommand();
    const supported = modelManager.getSupportedModels();

    if (sub === 'list') {
      const defaultModel = modelManager.getDefaultModel();
      await interaction.reply({
        content: `Available models: ${supported.join(', ')}\nDefault model: ${defaultModel}`,
        ephemeral: true,
      });
      return;
    }

    if (sub === 'current') {
      const current = modelManager.getModelForGuild(interaction.guildId);
      await interaction.reply({
        content: `Current model for this server: ${current}`,
        ephemeral: true,
      });
      return;
    }

    if (sub === 'set') {
      // Admin-only: require ManageGuild permission
      const isAdmin = !!(interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild));
      if (!isAdmin) {
        await interaction.reply({
          content: 'You need the Manage Server permission to change the model.',
          ephemeral: true,
        });
        return;
      }

      const selected = interaction.options.getString('model', true) as SupportedModel;
      if (!interaction.guildId) {
        await interaction.reply({
          content: 'Model configuration can only be changed in a server.',
          ephemeral: true,
        });
        return;
      }

      modelManager.setModelForGuild(interaction.guildId, selected);
      await interaction.reply({
        content: `Model updated to ${selected} for this server.`,
        ephemeral: true,
      });
      requestLogger.info('Model set via command', { selected });
      return;
    }

    await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
  } catch (error) {
    requestLogger.error('Model command failed', { error });
    await interaction.reply({ content: '❌ Failed to process model command.', ephemeral: true });
  }
}


