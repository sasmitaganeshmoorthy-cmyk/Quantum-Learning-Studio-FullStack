import { setServers } from 'node:dns';
import type { Db, MongoClient as MongoClientType } from 'mongodb';

declare global {
  var quantumMongoClientPromise:
    | Promise<MongoClientType>
    | undefined;
}

function configureMongoDns() {
  const servers =
    process.env.MONGODB_DNS_SERVERS ?? '8.8.8.8,1.1.1.1';

  setServers(
    servers
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean)
  );
}

async function createClientPromise(): Promise<MongoClientType> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  // Configure DNS before loading the MongoDB driver.
  configureMongoDns();

  const { MongoClient } = await import('mongodb');

  const client = new MongoClient(uri, {
    connectTimeoutMS: 10_000,
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 10,
  });

  return client.connect();
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function getMongoDatabase(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (!global.quantumMongoClientPromise) {
    global.quantumMongoClientPromise =
      createClientPromise().catch((error) => {
        global.quantumMongoClientPromise = undefined;
        throw error;
      });
  }

  const client = await global.quantumMongoClientPromise;
  return client.db(process.env.MONGODB_DB ?? 'quantum_learning_studio');
}
