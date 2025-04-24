// db/fullSync.ts
import { drizzle } from "drizzle-orm/expo-sqlite";
import { initializeDatabase } from "./initializeDatabase";
import { shopSearchList } from "./schema";
import { collection, getDocs } from "firebase/firestore";
import { db as firebaseDb } from "../FirebaseConfig";

export const fullSyncFirestoreToLocalDB = async () => {
  // Fetch the entire collection from Firestore.
  const collectionRef = collection(firebaseDb, "/System/SearchList/ShopListCollection");
  const querySnapshot = await getDocs(collectionRef);

  // Initialize local database and drizzle.
  const sqliteDb = await initializeDatabase();
  const drizzleDb = drizzle(sqliteDb);

  // Loop through the snapshot and insert records if they don't exist.
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    // Here, you might need to check whether the record already exists.
    // For simplicity, this example assumes you're always inserting.
    await drizzleDb.insert(shopSearchList).values({
      // Use a unique identifier from Firestore (like doc.id) to help with upserts.
      docId: doc.id,
      shopId: data.shopId,
      shopTitle: data.shopTitle,
    });
  }
  console.log("✅ Full sync complete.");
};
