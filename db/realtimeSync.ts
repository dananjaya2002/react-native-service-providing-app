// db/realtimeSync.ts
import { onSnapshot, collection } from "firebase/firestore";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { initializeDatabase } from "./initializeDatabase";
import { shopSearchList } from "./schema";
import { db as firebaseDb } from "../FirebaseConfig";
import { eq } from "drizzle-orm";

export const startRealtimeSync = async () => {
  //   await clearShopSearchList();
  // Initialize the local DB and the Drizzle ORM instance.
  const sqliteDb = await initializeDatabase();
  const drizzleDb = drizzle(sqliteDb);
  console.log("Drizzle drizzleDb", drizzleDb);

  // Create a reference to the Firestore collection.
  const collectionRef = collection(firebaseDb, "/System/SearchList/ShopListCollection");

  // Set up the realtime listener.
  const unsubscribe = onSnapshot(collectionRef, async (snapshot) => {
    console.log(`🔄 Firestore snapshot received with ${snapshot.docChanges().length} changes.`);
    for (const change of snapshot.docChanges()) {
      console.log(`Change type: ${change.type} for doc: ${change.doc.id}`, change.doc.data());
      const docId = change.doc.id;
      const data = change.doc.data();

      if (change.type === "added") {
        try {
          console.log(`Document added: ${docId}`);
          await drizzleDb.insert(shopSearchList).values({
            docId: docId,
            shopId: data.shopId,
            shopTitle: data.shopTitle,
          });
          // Optional: log count after insertion
          const rows = await drizzleDb.select().from(shopSearchList);

          console.log("Table count after insert:", rows.length);
        } catch (error) {
          console.error(`Error inserting document ${docId}:`, error);
        }
      } else if (change.type === "modified") {
        try {
          console.log(`Document modified: ${docId}`);
          await drizzleDb
            .update(shopSearchList)
            .set({
              shopId: data.shopId,
              shopTitle: data.shopTitle,
            })
            .where(eq(shopSearchList.docId, docId));
        } catch (error) {
          console.error(`Error updating document ${docId}:`, error);
        }
      } else if (change.type === "removed") {
        try {
          console.log(`Document removed: ${docId}`);
          await drizzleDb.delete(shopSearchList).where(eq(shopSearchList.docId, docId));
        } catch (error) {
          console.error(`Error deleting document ${docId}:`, error);
        }
      }
      const rows = await drizzleDb.select().from(shopSearchList);
      console.log("Current table count:", rows.length);
    }
  });

  console.log("✅ Firestore realtime sync started.");
  return unsubscribe;
};

const clearShopSearchList = async () => {
  const sqliteDb = await initializeDatabase();
  const drizzleDb = drizzle(sqliteDb);

  console.log("🧹 Clearing shopSearchList table");
  await drizzleDb.delete(shopSearchList);
  console.log("🧹 shopSearchList table cleared");
};
