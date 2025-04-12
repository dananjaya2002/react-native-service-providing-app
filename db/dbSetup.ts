// utility/dbSetup.ts
import { SQLiteDatabase } from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "appDatabase.db";

// Variable to hold database instance once initialized
let db: SQLiteDatabase | null = null;

export const setupSQLiteDB = async (): Promise<SQLiteDatabase> => {
  if (db) {
    return db;
  }

  // Path where the database will be stored
  const dbDirectory = FileSystem.documentDirectory + "SQLite/";

  // Ensure directory exists
  const dirInfo = await FileSystem.getInfoAsync(dbDirectory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dbDirectory, { intermediates: true });
  }

  // Full path to database file
  const dbPath = dbDirectory + DATABASE_NAME;

  // Open the database
  db = await SQLite.openDatabaseAsync(dbPath);

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS shops (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL
    );
  `);

  console.log("Database setup complete");
  return db;
};

// Get the database instance (call setupSQLiteDB first)
export const getDatabase = (): SQLiteDatabase => {
  if (!db) {
    throw new Error("Database not initialized. Call setupSQLiteDB first.");
  }
  return db;
};

// Close the database connection
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};
