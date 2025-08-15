import { FeatureFlagAdapter } from "../FeatureFlagAdapter";

export class ApiAdapter implements FeatureFlagAdapter {
  constructor(private baseUrl: string) {}

  // Add init() to satisfy the interface
  async init(): Promise<void> {
    // No initialization needed for API adapter
  }

  async getFlag(key: string, env: string) {
    const res = await fetch(`${this.baseUrl}/feature-flags/${env}/${key}`);
    if (!res.ok) return null;
    return res.json();
  }

  async getAllFlags(env: string) {
    const res = await fetch(`${this.baseUrl}/feature-flags/${env}`);
    return res.ok ? res.json() : [];
  }

  async upsertFlag(): Promise<void> {
    throw new Error("Not supported in frontend");
  }

  async deleteFlag(): Promise<void> {
    throw new Error("Not supported in frontend");
  }
}
