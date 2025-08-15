import { FeatureFlag, FeatureFlagAdapter } from "../FeatureFlagAdapter";

export class MemoryAdapter implements FeatureFlagAdapter {
  private flags: FeatureFlag[] = [];

  async init(): Promise<void> {
    // No setup needed for in-memory storage
  }

  async getFlag(key: string, env: string) {
    return this.flags.find((f) => f.key === key && f.environment === env);
  }

  async getAllFlags(env: string) {
    return this.flags.filter((f) => f.environment === env);
  }

  async upsertFlag(flag: FeatureFlag) {
    const idx = this.flags.findIndex(
      (f) => f.key === flag.key && f.environment === flag.environment
    );
    if (idx > -1) this.flags[idx] = flag;
    else this.flags.push(flag);
  }

  async deleteFlag(key: string, env: string) {
    this.flags = this.flags.filter(
      (f) => !(f.key === key && f.environment === env)
    );
  }
}
