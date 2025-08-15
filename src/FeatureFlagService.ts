import NodeCache from "node-cache";
import { FeatureFlag, FeatureFlagAdapter } from "./FeatureFlagAdapter";

export class FeatureFlagService {
  private cache: NodeCache;

  constructor(
    private adapter: FeatureFlagAdapter,
    private defaultEnv: string = "prod",
    private cacheTtl: number = 60 // seconds
  ) {
    this.cache = new NodeCache({ stdTTL: cacheTtl });
  }

  /**
   * Check if a feature flag is enabled.
   * @param key - Flag key
   * @param env - Environment (defaults to defaultEnv)
   * @param refresh - Bypass cache and fetch fresh value
   */
  async isEnabled(
    key: string,
    env?: string,
    refresh: boolean = false
  ): Promise<boolean> {
    const environment = env || this.defaultEnv;
    const cacheKey = `${environment}:${key}`;

    let flag: FeatureFlag | undefined;

    if (!refresh) {
      flag = this.cache.get<FeatureFlag>(cacheKey);
    }

    if (!flag) {
      flag = await this.adapter.getFlag(key, environment);
      if (flag) {
        this.cache.set(cacheKey, flag, this.cacheTtl);
      }
    }

    return flag?.enabled ?? false;
  }

  /**
   * Get all flags for an environment.
   * Uses cache per environment.
   */
  async getAllFlags(
    env?: string,
    refresh: boolean = false
  ): Promise<FeatureFlag[]> {
    const environment = env || this.defaultEnv;
    const cacheKey = `allFlags:${environment}`;

    let flags: FeatureFlag[] | undefined;

    if (!refresh) {
      flags = this.cache.get<FeatureFlag[]>(cacheKey);
    }

    if (!flags) {
      flags = await this.adapter.getAllFlags(environment);
      this.cache.set(cacheKey, flags, this.cacheTtl);
    }

    return flags;
  }

  /**
   * Upsert a flag and update the cache.
   */
  async setFlag(flag: FeatureFlag): Promise<void> {
    await this.adapter.upsertFlag(flag);

    const cacheKey = `${flag.environment}:${flag.key}`;
    this.cache.set(cacheKey, flag, this.cacheTtl);

    // Also refresh the environment cache
    const envCacheKey = `allFlags:${flag.environment}`;
    const allFlags = await this.adapter.getAllFlags(flag.environment);
    this.cache.set(envCacheKey, allFlags, this.cacheTtl);
  }

  /**
   * Delete a flag and remove it from cache.
   */
  async deleteFlag(key: string, env?: string): Promise<void> {
    const environment = env || this.defaultEnv;
    await this.adapter.deleteFlag(key, environment);

    const cacheKey = `${environment}:${key}`;
    this.cache.del(cacheKey);

    // Refresh environment cache
    const envCacheKey = `allFlags:${environment}`;
    const allFlags = await this.adapter.getAllFlags(environment);
    this.cache.set(envCacheKey, allFlags, this.cacheTtl);
  }
}
