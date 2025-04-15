// hooks/useSearchShopList.ts
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { like } from "drizzle-orm";

// Import your table schema; adjust the path and naming according to your project.
// In the latest versions, the schema definition might use camelCase property names.
import { shopSearchList } from "../db/schema";

// Open the database using the latest Expo SQLite method.
const db = SQLite.openDatabaseSync("app_database.db");
// Create an instance of Drizzle ORM with the latest configuration.
const orm = drizzle(db);

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

  useEffect(() => {
    // Clear results when query length is less than 3.
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        // Use the latest Drizzle ORM async query style.
        const queryResults = await orm
          .select()
          .from(shopSearchList)
          .where(like(shopSearchList.shopTitle, `%${query}%`))
          .all(); // Executes the query and retrieves all results

        setResults(
          queryResults.map((result) => ({
            id: result.id,
            // Note: Adapt the property names (docId, shopId) if your schema has changed.
            doc_id: result.docId,
            shop_id: result.shopId,
            shopTitle: result.shopTitle,
          })) as ShopSearchBarItem[]
        );
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, [query]);

  return { results, loading, error };
};
