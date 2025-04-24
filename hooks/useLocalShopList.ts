// hooks/useLocalShopList.ts
import { useEffect, useState } from "react";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { shopSearchList } from "../db/schema";
import { initializeDatabase } from "../db/initializeDatabase";
import { d } from "drizzle-kit/index-BAUrj6Ib";

// Define the type for our shop list items (from your Drizzle schema)
export type ShopListItem = {
  id: number;
  shopId: string;
  shopTitle: string;
};

const useLocalShopList = () => {
  const [shopList, setShopList] = useState<ShopListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Await the async database initialization
        const sqliteDb = await initializeDatabase();
        const drizzleDb = drizzle(sqliteDb);

        // Query all rows from shop_search_lists table using Drizzle
        const rows = await drizzleDb.select().from(shopSearchList);
        setShopList(rows);
        console.log("Fetched shop list:", rows);
      } catch (err) {
        console.error("Error querying local database:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
        console.log("Fetched shop list:", shopList);
      }
    }

    fetchData();
  }, []);

  return { shopList, loading, error };
};

export default useLocalShopList;
