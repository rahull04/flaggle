import { MongoClient, Db, Collection } from "mongodb";
import { FeatureFlag, FeatureFlagAdapter } from "../FeatureFlagAdapter";

export class MongoAdapter implements FeatureFlagAdapter {
  private client: MongoClient;
  private db!: Db;
  private collection!: Collection;

  constructor(
    private uri: string,
    private dbName: string = "feature_flags_db",
    private collectionName: string = "feature_flags",
    private autoMigrate: boolean = true
  ) {
    this.client = new MongoClient(uri);
  }

  async init() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    this.collection = this.db.collection(this.collectionName);

    if (this.autoMigrate) {
      // Seed if empty
      const count = await this.collection.countDocuments();
      if (count === 0) {
        await this.collection.insertMany([
          {
            key: "new-dashboard",
            enabled: true,
            environment: "dev",
            description: "Enables the new dashboard UI",
            updatedAt: new Date(),
          },
          {
            key: "beta-api",
            enabled: false,
            environment: "dev",
            description: "Enables beta API endpoints",
            updatedAt: new Date(),
          },
        ]);
      }
    }
  }

  async getFlag(key: string, env: string) {
    return (await this.collection.findOne({
      key,
      environment: env,
    })) as unknown as FeatureFlag | undefined;
  }

  async getAllFlags(env: string) {
    return (await this.collection
      .find({ environment: env })
      .toArray()) as unknown as FeatureFlag[];
  }

  async upsertFlag(flag: FeatureFlag) {
    await this.collection.updateOne(
      { key: flag.key, environment: flag.environment },
      { $set: flag },
      { upsert: true }
    );
  }

  async deleteFlag(key: string, env: string) {
    await this.collection.deleteOne({ key, environment: env });
  }
}
