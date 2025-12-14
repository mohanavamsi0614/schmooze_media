import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO;
const client = new MongoClient(uri);

let db;

export async function connectToDatabase() {
  if (db) {
    return db;
  }

  await client.connect();
  db = client.db("schmoze_media");

  console.log("MongoDB connected");
  return db;
}
