// utility/u_searchShops.ts
import { getDatabase } from "../db/dbSetup";
import { ShopMinimal } from "../hooks/useShopSyncSQL";

// Define a type for the expected structure of each result set returned by execAsync.
type SQLiteResult = {
  rows: {
    length: number;
    item: (index: number) => ShopMinimal;
  };
};

export const searchLocalShops = async (query: string): Promise<ShopMinimal[]> => {
  checkDatabaseContents(); // Check database contents before searching
  try {
    const db = getDatabase();
    // Type cast the result as SQLiteResult array.
    const results = (await db.execAsync(
      `SELECT * FROM shops WHERE title LIKE '%${query}%'`
    )) as unknown as SQLiteResult[];

    // Parse the results. Typically, results[0] will have a "rows" property.
    if (results && results.length > 0 && results[0].rows) {
      const rows = results[0].rows;
      const shops: ShopMinimal[] = [];
      for (let i = 0; i < rows.length; i++) {
        shops.push(rows.item(i));
      }
      return shops;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error searching shops:", error);
    return [];
  }
};

export const checkDatabaseContents = async () => {
  try {
    const db = getDatabase();
    const result = (await db.execAsync("SELECT * FROM shops")) as unknown as SQLiteResult[];
    if (result && result.length > 0 && result[0].rows) {
      console.log("✅ Database Contents:", result[0].rows);
    } else {
      console.log("✅ Database Contents: No data found.");
    }
  } catch (error) {
    console.error("❌ Error accessing database:", error);
  }
};
