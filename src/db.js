const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "biblioteca";

let db;

async function conectar() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`✅ MongoDB conectado: ${DB_NAME}`);
}

function getDb() {
  if (!db) throw new Error("Banco não conectado. Chame conectar() primeiro.");
  return db;
}

module.exports = { conectar, getDb };
