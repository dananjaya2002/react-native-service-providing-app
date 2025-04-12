import { drizzle } from "drizzle-orm/expo-sqlite";
import { initializeDatabase } from "./initializeDatabase";
import { shopSearchList } from "./schema";
import { collection, getDocs } from "firebase/firestore";
import { db as firebaseDb } from "../FirebaseConfig";

export const syncFirestoreToLocalDB = async () => {
  try {
    // Connect to Firestore collection
    const collectionRef = collection(firebaseDb, "/System/SearchList/ShopListCollection");
    const querySnapshot = await getDocs(collectionRef);

    // Initialize your SQLite DB and set up Drizzle ORM instance
    const sqliteDb = await initializeDatabase(); // Await the async function
    const drizzleDb = drizzle(sqliteDb);

    // Iterate Firestore docs and insert them into the local table
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      // Adjust field names as necessary. Here we're assuming `shopId` and `shopTitle` exist.
      await drizzleDb.insert(shopSearchList).values({
        docId: doc.id, // Firestore document ID for matching updates/deletions
        shopId: data.shopId,
        shopTitle: data.shopTitle,
      });
    }
    console.log("✅ Firestore synchronization complete.");
  } catch (error) {
    console.error("🔥 Error during Firestore sync:", error);
  }
};
