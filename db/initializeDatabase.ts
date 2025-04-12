import * as SQLite from "expo-sqlite";

export const initializeDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("app_database.db");
  console.log("✅ SQLite database opened successfully.");

  // Execute SQL command to create the table if it doesn't exist.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS shop_search_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      shop_id TEXT NOT NULL, 
      shopTitle TEXT NOT NULL
    );
  `);

  return db;
};
