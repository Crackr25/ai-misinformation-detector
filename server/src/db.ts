import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

export async function getDb() {
  if (db) return db;

  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      user_id INTEGER PRIMARY KEY,
      api_key TEXT,
      model TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      timestamp TEXT,
      content TEXT,
      image_url TEXT,
      is_ai_generated INTEGER,
      confidence_score REAL,
      risk_level TEXT,
      indicators TEXT,
      fact_check_suggestion TEXT,
      verdict TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  return db;
}
