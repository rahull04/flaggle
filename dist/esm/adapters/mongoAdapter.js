export class MongoAdapter {
    constructor(uri, dbName = "feature_flags_db", collectionName = "flaggle", autoMigrate = true) {
        this.uri = uri;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.autoMigrate = autoMigrate;
    }
    async init() {
        const { MongoClient } = await import("mongodb");
        this.client = new MongoClient(this.uri);
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        this.collection = this.db.collection(this.collectionName);
        if (this.autoMigrate) {
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
    async getFlag(key, env) {
        return (await this.collection.findOne({ key, environment: env }));
    }
    async getAllFlags(env) {
        return (await this.collection
            .find({ environment: env })
            .toArray());
    }
    async upsertFlag(flag) {
        await this.collection.updateOne({ key: flag.key, environment: flag.environment }, { $set: flag }, { upsert: true });
    }
    async deleteFlag(key, env) {
        await this.collection.deleteOne({ key, environment: env });
    }
}
