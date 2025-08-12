import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../utils/logger';

export type SupportedModel = 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano';

interface ModelConfigFile {
  version: number;
  defaultModel: SupportedModel;
  guildModels: Record<string, SupportedModel>;
}

class ModelManager {
  private readonly supportedModels: SupportedModel[] = ['gpt-5', 'gpt-5-mini', 'gpt-5-nano'];
  private readonly defaultModel: SupportedModel = 'gpt-5';
  private readonly dataDir: string;
  private readonly configPath: string;
  private cache: ModelConfigFile | null = null;

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    this.configPath = path.join(this.dataDir, 'model-config.json');
    this.ensureLoaded();
  }

  getSupportedModels(): SupportedModel[] {
    return [...this.supportedModels];
  }

  getDefaultModel(): SupportedModel {
    return this.cache?.defaultModel || this.defaultModel;
  }

  getModelForGuild(guildId?: string | null): SupportedModel {
    if (!guildId) return this.getDefaultModel();
    this.ensureLoaded();
    const model = this.cache!.guildModels[guildId];
    return model || this.getDefaultModel();
  }

  setModelForGuild(guildId: string, model: SupportedModel): void {
    if (!this.supportedModels.includes(model)) {
      throw new Error(`Unsupported model: ${model}`);
    }
    this.ensureLoaded();
    this.cache!.guildModels[guildId] = model;
    this.persist();
    logger.info('Model updated for guild', { guildId, model });
  }

  private ensureLoaded(): void {
    if (this.cache) return;
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(raw) as ModelConfigFile;
        // Basic validation
        if (!parsed.version || !parsed.defaultModel || !parsed.guildModels) {
          throw new Error('Invalid model-config structure');
        }
        this.cache = parsed;
      } else {
        this.cache = {
          version: 1,
          defaultModel: this.defaultModel,
          guildModels: {}
        };
        this.persist();
      }
    } catch (error) {
      logger.error('Failed to load model-config.json, using defaults', { error });
      this.cache = {
        version: 1,
        defaultModel: this.defaultModel,
        guildModels: {}
      };
      this.persist();
    }
  }

  private persist(): void {
    try {
      if (!this.cache) return;
      const tmpPath = `${this.configPath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.cache, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.configPath);
    } catch (error) {
      logger.error('Failed to persist model-config.json', { error });
    }
  }
}

export const modelManager = new ModelManager();


