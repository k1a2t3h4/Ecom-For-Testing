import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://ecommerce:Kathiravan_2004@ecommerce.jc096.mongodb.net/?retryWrites=true&w=majority';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect()
    .then((client) => {
      console.log('MongoDB connected successfully');
      return client;
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
}
clientPromise = global._mongoClientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db();
}

// For TypeScript global
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
} 