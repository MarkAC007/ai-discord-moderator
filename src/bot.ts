import { 
  Client, 
  GatewayIntentBits, 
  Collection, 
  Events, 
  ChatInputCommandInteraction 
} from 'discord.js';
import { logger } from './utils/logger';
import { AIService } from './services/ai';

// Import commands
import * as askCommand from './commands/ask';
import * as helpCommand from './commands/help';
import * as pingCommand from './commands/ping';

interface Command {
  data: any;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export class Bot {
  private client: Client;
  private commands: Collection<string, Command>;
  private aiService: AIService;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds, // Minimal intents for slash commands
      ]
    });

    this.commands = new Collection();
    this.aiService = new AIService();

    this.setupEventHandlers();
    this.registerCommands();
  }

  private setupEventHandlers(): void {
    // Ready event
    this.client.once(Events.ClientReady, () => {
      logger.info('Bot is ready!', { 
        user: this.client.user?.tag,
        guilds: this.client.guilds.cache.size 
      });
    });

    // Interaction create event
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) {
        logger.warn('Unknown command received', { 
          commandName: interaction.commandName,
          userId: interaction.user.id 
        });
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error('Error executing command', { 
          commandName: interaction.commandName,
          userId: interaction.user.id,
          error 
        });

        const errorMessage = '❌ An error occurred while executing this command.';
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
    });

    // Error handling
    this.client.on('error', (error) => {
      logger.error('Discord client error', { error });
    });

    this.client.on('warn', (warning) => {
      logger.warn('Discord client warning', { warning });
    });
  }

  private registerCommands(): void {
    // Register all commands
    this.commands.set(askCommand.data.name, askCommand);
    this.commands.set(helpCommand.data.name, helpCommand);
    this.commands.set(pingCommand.data.name, pingCommand);

    logger.info('Commands registered', { 
      commandCount: this.commands.size,
      commands: Array.from(this.commands.keys())
    });
  }

  async start(): Promise<void> {
    try {
      // Test OpenAI connection
      logger.info('Testing OpenAI connection...');
      const openaiConnected = await this.aiService.testConnection();
      if (!openaiConnected) {
        throw new Error('Failed to connect to OpenAI API');
      }
      logger.info('OpenAI connection successful');

      // Login to Discord
      const token = process.env['DISCORD_BOT_TOKEN'];
      if (!token) {
        throw new Error('DISCORD_BOT_TOKEN environment variable is required');
      }

      await this.client.login(token);
      logger.info('Discord login successful');

      // Register slash commands globally
      await this.registerSlashCommands();
      logger.info('Slash commands registered globally');

    } catch (error) {
      logger.error('Failed to start bot', { error });
      throw error;
    }
  }

  private async registerSlashCommands(): Promise<void> {
    try {
      const appId = process.env['DISCORD_APP_ID'];
      if (!appId) {
        throw new Error('DISCORD_APP_ID environment variable is required');
      }

      const commands = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
      
      // Ensure we have the application
      if (!this.client.application) {
        throw new Error('Bot application not available. Make sure the bot is properly logged in.');
      }
      
      // Register commands globally
      await this.client.application.commands.set(commands);
      
      logger.info('Slash commands registered globally', { 
        commandCount: commands.length,
        commands: commands.map(cmd => cmd.name),
        appId
      });

    } catch (error) {
      logger.error('Failed to register slash commands', { error });
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      logger.info('Destroying bot...');
      await this.client.destroy();
      logger.info('Bot destroyed successfully');
    } catch (error) {
      logger.error('Error destroying bot', { error });
    }
  }

  getClient(): Client {
    return this.client;
  }
}
