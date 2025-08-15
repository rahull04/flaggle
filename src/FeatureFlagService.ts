import NodeCache from "node-cache";
import { FeatureFlag, FeatureFlagAdapter } from "./FeatureFlagAdapter";

export class FeatureFlagService {
  private cache: NodeCache;

  constructor(
    private adapter: FeatureFlagAdapter,
    private defaultEnv: string = "prod",
    private cacheTtl: number = 60
  ) {
    this.cache = new NodeCache({ stdTTL: cacheTtl });
  }

  async isEnabled(key: string, env?: string): Promise<boolean> {
    const environment = env || this.defaultEnv;
    const cacheKey = `${environment}:${key}`;

    let flag = this.cache.get<FeatureFlag>(cacheKey);
    if (!flag) {
      flag = await this.adapter.getFlag(key, environment);
      if (flag) this.cache.set(cacheKey, flag);
    }
    return flag?.enabled ?? false;
  }

  async getAllFlags(env?: string) {
    const environment = env || this.defaultEnv;
    return this.adapter.getAllFlags(environment);
  }

  async setFlag(flag: FeatureFlag) {
    await this.adapter.upsertFlag(flag);
    this.cache.set(`${flag.environment}:${flag.key}`, flag);
  }
}
