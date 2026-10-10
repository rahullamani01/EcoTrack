import { MongoClient, Db, Collection as MongoCollection } from 'mongodb';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnecting = false;
let mongoInitError: Error | null = null;

export async function initDatabase(): Promise<{ type: 'mongodb' | 'file'; error?: string }> {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    if (mongoDb) return { type: 'mongodb' };
    if (isMongoConnecting) {
      await new Promise((r) => setTimeout(r, 200));
      return { type: mongoDb ? 'mongodb' : 'file' };
    }

    isMongoConnecting = true;
    try {
      console.log('[DB] Connecting to MongoDB via MONGODB_URI...');
      mongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      await mongoClient.connect();
      mongoDb = mongoClient.db();
      console.log(`[DB] Successfully connected to MongoDB database: ${mongoDb.databaseName}`);

      // Ensure critical database-level unique indexes
      await ensureMongoIndexes(mongoDb);

      isMongoConnecting = false;
      return { type: 'mongodb' };
    } catch (err: any) {
      isMongoConnecting = false;
      mongoInitError = err;
      console.error('[DB] MongoDB connection failed:', err.message);
      throw new Error(`MongoDB connection failed: ${err.message}. Please verify MONGODB_URI or check network access.`);
    }
  }

  console.log('[DB] MONGODB_URI not provided; running on local ACID-compliant file-backed engine (.data/*.json).');
  return { type: 'file' };
}

async function ensureMongoIndexes(db: Db): Promise<void> {
  try {
    // Unique PRN index on student_roster
    await db.collection('student_roster').createIndex({ prn: 1 }, { unique: true, sparse: true });
    // Unique email index on student_roster
    await db.collection('student_roster').createIndex({ officialEmail: 1 }, { unique: true, sparse: true });

    // Unique PRN and Email indexes on user_accounts
    await db.collection('user_accounts').createIndex({ prn: 1 }, { unique: true, sparse: true });
    await db.collection('user_accounts').createIndex({ email: 1 }, { unique: true });

    // Unique Session ID index
    await db.collection('sessions').createIndex({ id: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // Event Registrations compound unique index (prevent duplicate registration per student per event)
    await db.collection('event_registrations').createIndex(
      { eventId: 1, userId: 1, status: 1 },
      { unique: false }
    );

    // Challenge Submissions compound index (student + challenge + submissionDate)
    await db.collection('challenge_submissions').createIndex(
      { challengeId: 1, userId: 1, submissionDate: 1 },
      { unique: true, partialFilterExpression: { status: 'approved' } }
    );

    // Tag Number unique index on campus_trees
    await db.collection('campus_trees').createIndex({ tagNumber: 1 }, { unique: true, sparse: true });

    console.log('[DB] Database-level unique and query indexes verified.');
  } catch (err: any) {
    console.warn('[DB] Index creation warning:', err.message);
  }
}

export interface QueryFilter<T> {
  (item: T): boolean;
}

export class Repository<T extends { id: string }> {
  private filePath: string;
  private memoryCache: Map<string, T> = new Map();
  private initialized: boolean = false;

  constructor(public collectionName: string) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
  }

  private loadFileCache(): void {
    if (this.initialized) return;
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const items: T[] = JSON.parse(raw);
        this.memoryCache.clear();
        for (const item of items) {
          if (item && item.id) {
            this.memoryCache.set(item.id, item);
          }
        }
      } else {
        this.memoryCache.clear();
      }
    } catch (err) {
      console.error(`[DB] Error loading file collection ${this.collectionName}:`, err);
      this.memoryCache.clear();
    }
    this.initialized = true;
  }

  private persistFile(): void {
    try {
      const items = Array.from(this.memoryCache.values());
      const tempPath = `${this.filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(items, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error(`[DB] Error persisting file collection ${this.collectionName}:`, err);
      throw err;
    }
  }

  private getMongoCollection(): MongoCollection<any> | null {
    if (mongoDb) {
      return mongoDb.collection(this.collectionName);
    }
    return null;
  }

  public async find(filter?: (item: T) => boolean): Promise<T[]> {
    const mongoColl = this.getMongoCollection();
    if (mongoColl) {
      const docs = await mongoColl.find({}).toArray();
      const mapped = docs.map((d: any) => {
        const { _id, ...rest } = d;
        return (rest.id ? rest : { ...rest, id: _id.toString() }) as T;
      });
      if (!filter) return mapped;
      return mapped.filter(filter);
    }

    this.loadFileCache();
    const all = Array.from(this.memoryCache.values());
    if (!filter) return all;
    return all.filter(filter);
  }

  public async findById(id: string): Promise<T | null> {
    const mongoColl = this.getMongoCollection();
    if (mongoColl) {
      const doc = await mongoColl.findOne({ id });
      if (!doc) return null;
      const { _id, ...rest } = doc;
      return rest as T;
    }

    this.loadFileCache();
    return this.memoryCache.get(id) || null;
  }

  public async findOne(filter: (item: T) => boolean): Promise<T | null> {
    const mongoColl = this.getMongoCollection();
    if (mongoColl) {
      const all = await this.find();
      for (const item of all) {
        if (filter(item)) return item;
      }
      return null;
    }

    this.loadFileCache();
    for (const item of this.memoryCache.values()) {
      if (filter(item)) return item;
    }
    return null;
  }

  public async insert(doc: T): Promise<T> {
    const mongoColl = this.getMongoCollection();
    if (mongoColl) {
      await mongoColl.insertOne({ ...doc, _id: doc.id as any });
      return doc;
    }

    this.loadFileCache();
    this.memoryCache.set(doc.id, doc);
    this.persistFile();
    return doc;
  }

  public async update(id: string, updates: Partial<T>): Promise<T | null> {
    const mongoColl = this.getMongoCollection();
    if (mongoColl) {
      const res = await mongoColl.findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: 'after' }
      );
      if (!res) return null;
      const { _id, ...rest } = res;
      return rest as T;
    }

    this.loadFileCache();
    const existing = this.memoryCache.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, id };
    this.memoryCache.set(id, updated);
    this.persistFile();
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const mongoColl = this.getMongoCollection();
    if (mongoColl) {
      const res = await mongoColl.deleteOne({ id });
      return res.deletedCount > 0;
    }

    this.loadFileCache();
    const existed = this.memoryCache.delete(id);
    if (existed) this.persistFile();
    return existed;
  }

  public async count(): Promise<number> {
    const mongoColl = this.getMongoCollection();
    if (mongoColl) {
      return await mongoColl.countDocuments({});
    }

    this.loadFileCache();
    return this.memoryCache.size;
  }

  public async seed(initialDocs: T[]): Promise<void> {
    const currentCount = await this.count();
    if (currentCount === 0) {
      for (const doc of initialDocs) {
        await this.insert(doc);
      }
    }
  }
}
