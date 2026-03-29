import { MongoClient, Db } from 'mongodb'

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let prodClientPromise: Promise<MongoClient> | undefined

function buildClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      'Missing MONGODB_URI. Add your MongoDB Atlas connection string to .env.local (server-only; do not use NEXT_PUBLIC_).'
    )
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect()
    }
    return global._mongoClientPromise
  }

  if (!prodClientPromise) {
    prodClientPromise = new MongoClient(uri).connect()
  }
  return prodClientPromise
}

/** Server-only. Use from Route Handlers, Server Actions, or other server code — never from client components. */
export function getMongoClientPromise(): Promise<MongoClient> {
  return buildClientPromise()
}

/** Default database name from MONGODB_DB_NAME, or `property_insides` if unset. */
export async function getDb(name?: string): Promise<Db> {
  const client = await getMongoClientPromise()
  const dbName = name ?? process.env.MONGODB_DB_NAME ?? 'lyubomirdias_db_user'
  return client.db(dbName)
}
