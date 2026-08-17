import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig, ConfigValueType } from './entities/system-config.entity';

@Injectable()
export class ConfigCacheService implements OnModuleInit {
  private readonly logger = new Logger(ConfigCacheService.name);
  private cache = new Map<string, any>();

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing System Config Cache...');
    await this.refreshCache();
  }

  /**
   * Refreshes the internal cache from the database.
   */
  async refreshCache(): Promise<void> {
    const configs = await this.configRepo.find();
    this.cache.clear();
    for (const config of configs) {
      this.cache.set(config.key, this.parseValue(config.value, config.valueType));
    }
    this.logger.log(`Loaded ${this.cache.size} configurations into cache.`);
  }

  /**
   * Invalidates the cache and forces a refresh from DB.
   */
  async invalidate(): Promise<void> {
    this.logger.log('Invalidating System Config Cache...');
    await this.refreshCache();
  }

  /**
   * Gets a configuration value from cache.
   * If not present, it fetches from DB, updates cache, and returns it.
   */
  async get(key: string, defaultValue?: any): Promise<any> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Cache miss: load from DB
    const config = await this.configRepo.findOne({ where: { key } });
    if (config) {
      const parsedValue = this.parseValue(config.value, config.valueType);
      this.cache.set(config.key, parsedValue);
      return parsedValue;
    }

    return defaultValue;
  }

  /**
   * Helper to parse string value based on valueType.
   */
  private parseValue(value: string, type: string): any {
    if (value === null || value === undefined) return value;
    try {
      switch (type) {
        case 'INT':
          return parseInt(value, 10);
        case 'BOOLEAN':
          return value === 'true';
        case 'JSON':
          return JSON.parse(value);
        case 'STRING':
        default:
          return value;
      }
    } catch (error) {
      this.logger.error(`Error parsing config value for type ${type}: ${value}`, error);
      return value;
    }
  }
}
