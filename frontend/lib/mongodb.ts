import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    if (!uri) {
      throw new Error('Please add your Mongo URI to .env.local')
    }
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  if (!uri) {
    clientPromise = Promise.reject(new Error('Please add MONGODB_URI to environment variables'))
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export default clientPromise
