import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongodInstance: MongoMemoryServer | null = null;

/**
 * Connects to MongoDB with automatic, bulletproof failover.
 * If MONGODB_URI is provided and accessible, it connects to it.
 * If MONGODB_URI is missing, invalid, or unreachable (e.g., Atlas IP whitelist block),
 * it seamlessly launches and connects to an in-memory MongoDB instance.
 */
export const connectDB = async (): Promise<void> => {
  const remoteUri = process.env.MONGODB_URI?.trim();

  // Set reasonable buffer timeout so queries fail fast rather than hanging indefinitely if connection drops
  mongoose.set('bufferTimeoutMS', 5000);

  // 1. Try connecting to remote URI if provided
  if (remoteUri) {
    try {
      console.log(`[MarketLink MongoDB] Attempting connection to configured MONGODB_URI...`);
      const conn = await mongoose.connect(remoteUri, {
        dbName: 'marketlink',
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
      console.log(`[MarketLink MongoDB] Connected successfully to remote cluster: ${conn.connection.host}`);
      return;
    } catch (remoteErr: any) {
      console.warn(
        `[MarketLink MongoDB] Remote MongoDB connection failed (${remoteErr.message || remoteErr}). Switching to high-performance in-memory MongoDB instance...`
      );
      // Disconnect failed connection attempt before in-memory launch
      try {
        await mongoose.disconnect();
      } catch {
        /* ignore */
      }
    }
  }

  // 2. Launch in-memory MongoDB fallback
  try {
    console.log('[MarketLink MongoDB] Launching in-memory MongoDB instance...');
    if (!mongodInstance) {
      mongodInstance = await MongoMemoryServer.create({ instance: { dbName: 'marketlink' } });
    }
    const inMemUri = mongodInstance.getUri();
    console.log(`[MarketLink MongoDB] In-memory MongoDB instance started at: ${inMemUri}`);

    const conn = await mongoose.connect(inMemUri, {
      dbName: 'marketlink',
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MarketLink MongoDB] Connected successfully to in-memory database: ${conn.connection.host}`);
  } catch (memErr) {
    console.error('[MarketLink MongoDB] Critical: Failed to initialize in-memory MongoDB:', memErr);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
  } catch (err) {
    console.error('[MarketLink MongoDB] Error during disconnect:', err);
  }
};

export default connectDB;
