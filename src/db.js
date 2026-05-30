const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27018";
const DB_NAME = "biblioteca";

let db;
let client;

async function conectar() {
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`MongoDB conectado: ${DB_NAME}`);
}

function getDb() {
  if (!db) throw new Error("Banco nao conectado. Chame conectar() primeiro.");
  return db;
}

function getClient() {
  if (!client) throw new Error("MongoClient nao conectado. Chame conectar() primeiro.");
  return client;
}

module.exports = { conectar, getDb, getClient };
