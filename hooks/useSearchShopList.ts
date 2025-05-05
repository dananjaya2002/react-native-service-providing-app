// hooks/useSearchShopList.ts
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { like } from "drizzle-orm";
import { initializeDatabase } from "../db/initializeDatabase";
import { shopSearchList } from "../db/schema";

// Define interface - keeping existing code
export interface ShopSearchBarItem {
  id: number;
  doc_id: string;
  shop_id: string;
  shopTitle: string;
}

export const useSearchShopList = (query: string) => {
  const [results, setResults] = useState<ShopSearchBarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [orm, setOrm] = useState<any>(null);

  // Initialize the database when the component mounts
  useEffect(() => {
    const setupDb = async () => {
      try {
        const sqliteDb = await initializeDatabase();
        const drizzleOrm = drizzle(sqliteDb);
        setOrm(drizzleOrm);
        setDbInitialized(true);
      } catch (e) {
        console.error("Failed to initialize database:", e);
        setError(e as Error);
      }
    };

    setupDb();
  }, []);

  useEffect(() => {
    // Don't run the query until the DB is ready and query is valid
    if (!dbInitialized || !orm || query.length < 3) {
      if (query.length < 3) setResults([]);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const queryResults = await orm
          .select()
          .from(shopSearchList)
          .where(like(shopSearchList.shopTitle, `%${query}%`))
          .all();

        setResults(
          queryResults.map((result: any) => ({
            id: result.id,
            doc_id: result.docId,
            shop_id: result.shopId,
            shopTitle: result.shopTitle,
          })) as ShopSearchBarItem[]
        );
      } catch (e) {
        console.error("Search query error:", e);
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, [query, dbInitialized, orm]);

  return { results, loading, error };
};
