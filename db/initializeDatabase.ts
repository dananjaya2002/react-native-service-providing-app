import * as SQLite from "expo-sqlite";

export const initializeDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("app_database.db");
  console.log("✅ SQLite database opened successfully.");

  // // Clear the table if in development (remove this in production)
  // // You can use a flag or environment variable here.
  // if (__DEV__) {
  //   console.log(" ❗❗❗ ☢️ Development mode: dropping shop_search_lists table. ☢️ ❗❗❗");
  //   await db.execAsync(`DROP TABLE IF EXISTS shop_search_lists;`);
  // }

  // Execute SQL command to create the table if it doesn't exist.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS shop_search_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      doc_id TEXT NOT NULL,
      shop_id TEXT NOT NULL, 
      shopTitle TEXT NOT NULL
    );
  `);

  return db;
};
