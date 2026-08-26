import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigCacheService } from './config-cache.service';
import { SystemConfig, ConfigValueType } from './entities/system-config.entity';

describe('ConfigCacheService', () => {
  let service: ConfigCacheService;
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigCacheService,
        { provide: getRepositoryToken(SystemConfig), useValue: repo },
      ],
    }).compile();
    service = mod.get(ConfigCacheService);
    jest.clearAllMocks();
  });

  it('refreshCache loads all configs into in-memory map', async () => {
    repo.find.mockResolvedValueOnce([
      { key: 'feature.x', value: '1', valueType: ConfigValueType.INT },
      { key: 'feature.y', value: 'true', valueType: ConfigValueType.BOOLEAN },
      { key: 'feature.z', value: '{"k":1}', valueType: ConfigValueType.JSON },
      { key: 'feature.w', value: 'plain', valueType: ConfigValueType.STRING },
    ]);
    await service.refreshCache();
    expect(await service.get('feature.x')).toBe(1);
    expect(await service.get('feature.y')).toBe(true);
    expect(await service.get('feature.z')).toEqual({ k: 1 });
    expect(await service.get('feature.w')).toBe('plain');
  });

  it('refreshCache parses malformed JSON to raw string and logs error', async () => {
    repo.find.mockResolvedValueOnce([
      { key: 'bad.json', value: '{not json', valueType: ConfigValueType.JSON },
    ]);
    await service.refreshCache();
    expect(await service.get('bad.json')).toBe('{not json');
  });

  it('refreshCache keeps null/undefined values as-is', async () => {
    repo.find.mockResolvedValueOnce([
      { key: 'empty', value: null, valueType: ConfigValueType.STRING },
    ]);
    await service.refreshCache();
    expect(await service.get('empty')).toBeNull();
  });

  it('get returns cached value without hitting DB', async () => {
    repo.find.mockResolvedValueOnce([
      { key: 'cached', value: '5', valueType: ConfigValueType.INT },
    ]);
    await service.refreshCache();
    repo.findOne.mockClear();
    const v = await service.get('cached');
    expect(v).toBe(5);
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('get on cache miss loads from DB and caches result', async () => {
    repo.findOne.mockResolvedValueOnce({
      key: 'lazy',
      value: '42',
      valueType: ConfigValueType.INT,
    });
    const v = await service.get('lazy');
    expect(v).toBe(42);
    const second = await service.get('lazy');
    expect(second).toBe(42);
    expect(repo.findOne).toHaveBeenCalledTimes(1);
  });

  it('get returns defaultValue when key is missing', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    expect(await service.get('missing', 'fallback')).toBe('fallback');
  });

  it('invalidate triggers a refresh from DB', async () => {
    repo.find.mockResolvedValue([]);
    await service.invalidate();
    expect(repo.find).toHaveBeenCalled();
  });

  it('onModuleInit calls refreshCache', async () => {
    repo.find.mockResolvedValue([]);
    await service.onModuleInit();
    expect(repo.find).toHaveBeenCalled();
  });
});
