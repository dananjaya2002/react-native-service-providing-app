//hook/useShopSyncSQL.ts
import { useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "../FirebaseConfig"; // Adjust as needed
import { setupSQLiteDB, getDatabase } from "../db/dbSetup"; // Adjust as needed

export interface ShopMinimal {
  id: string;
  title: string;
}

export const useSyncShopsSQL = () => {
  useEffect(() => {
    // Wrap async initialization in an IIFE
    (async () => {
      // Ensure the DB is initialized
      await setupSQLiteDB();
      console.log("✅ SQLite DB initialized in useSyncShopsSQL");

      const firestore = getFirestore(app);
      const shopsCollection = collection(firestore, "/System/SearchList/ShopListCollection");

      const unsubscribe = onSnapshot(
        shopsCollection,
        (snapshot) => {
          console.log("📥 Firestore snapshot received:", snapshot.size, "documents");
          snapshot.docChanges().forEach(async (change) => {
            const shopData = change.doc.data() as Partial<any>;
            const shopId = shopData.shopId || null;
            const shopTitle = shopData.shopTitle || "";
            const db = getDatabase();

            console.log(`🔄 Processing change: ${change.type} for shop ID: ${shopId}`);

            try {
              if (change.type === "added") {
                console.log(`➕ Adding shop: ${shopId} - ${shopTitle}`);
                await db.execAsync(
                  `INSERT OR REPLACE INTO shops (id, title) VALUES ("${shopId}", "${shopTitle}")`
                );
              } else if (change.type === "modified") {
                console.log(`✏️ Modifying shop: ${shopId} - ${shopTitle}`);
                await db.execAsync(
                  `UPDATE shops SET title = "${shopTitle}" WHERE id = "${shopId}"`
                );
              } else if (change.type === "removed") {
                console.log(`❌ Removing shop: ${shopId}`);
                await db.execAsync(`DELETE FROM shops WHERE id = "${shopId}"`);
              }
            } catch (error) {
              console.error("DB operation error for shop", shopId, error);
            }
          });
        },
        (error) => {
          console.error("Error syncing shops from Firebase:", error);
        }
      );

      // Clean up the listener on unmount
      return unsubscribe;
    })();
  }, []);
};
