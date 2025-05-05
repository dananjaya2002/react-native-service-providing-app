import { onSnapshot, collection, getDocs } from "firebase/firestore";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { initializeDatabase } from "./initializeDatabase";
import { shopSearchList } from "./schema";
import { db as firebaseDb } from "../FirebaseConfig";
import { eq } from "drizzle-orm";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for tracking sync state
const SYNC_INITIALIZED_KEY = "shop_search_sync_initialized";
const LISTENER_ACTIVE_KEY = "shop_search_listener_active";

// Global listener reference to maintain across component rerenders
// (but not app reloads - that's what AsyncStorage is for)
let globalUnsubscribe: (() => void) | null = null;

export const startRealtimeSync = async () => {
  // Check if first-time setup is needed
  const hasInitialized = await AsyncStorage.getItem(SYNC_INITIALIZED_KEY);
  const listenerActive = await AsyncStorage.getItem(LISTENER_ACTIVE_KEY);

  // Initialize database connection
  const sqliteDb = await initializeDatabase();
  const drizzleDb = drizzle(sqliteDb);

  // If first run or no initialization yet, do full table sync
  if (!hasInitialized) {
    console.log("🔄 First-time sync: Clearing and reloading data");
    await clearShopSearchList(); // Clear existing data
    await initialSync(drizzleDb); // Load initial data
    await AsyncStorage.setItem(SYNC_INITIALIZED_KEY, "true");
  } else {
    // Check if table has data to avoid issues
    const count = await drizzleDb.select().from(shopSearchList).all();
    if (count.length === 0) {
      console.log("🔄 Table empty despite initialization flag - resyncing");
      await initialSync(drizzleDb);
    } else {
      console.log(`✅ Database has ${count.length} shops already`);
    }
  }

  // Only set up a new listener if one doesn't exist already
  if (!globalUnsubscribe && !listenerActive) {
    console.log("🔄 Setting up NEW realtime listener");
    globalUnsubscribe = setupRealtimeListener(drizzleDb);
    await AsyncStorage.setItem(LISTENER_ACTIVE_KEY, "true");
  } else {
    console.log("✅ Using existing listener - no new Firestore reads");
  }

  return globalUnsubscribe;
};

// Function to do initial data load
const initialSync = async (drizzleDb: any) => {
  try {
    const collectionRef = collection(firebaseDb, "/System/SearchList/ShopListCollection");
    const querySnapshot = await getDocs(collectionRef);

    console.log(`📥 Initial sync: Fetched ${querySnapshot.docs.length} documents`);

    // Process all documents
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      await drizzleDb.insert(shopSearchList).values({
        docId: doc.id,
        shopId: data.shopId,
        shopTitle: data.shopTitle,
      });
    }

    console.log(`✅ Initial sync complete with ${querySnapshot.docs.length} documents`);
  } catch (error) {
    console.error("Error in initialSync:", error);
  }
};

// Set up realtime listener with duplicate protection
const setupRealtimeListener = (drizzleDb: any) => {
  const collectionRef = collection(firebaseDb, "/System/SearchList/ShopListCollection");

  // This is a special optimization to handle the first snapshot
  // which will include ALL existing documents as "added" changes
  let isFirstSnapshot = true;

  return onSnapshot(collectionRef, async (snapshot) => {
    console.log(`🔄 Firestore snapshot received with ${snapshot.docChanges().length} changes`);

    // Skip processing the first snapshot if we've already done initial sync
    // This prevents duplicate processing of all documents on app start
    if (isFirstSnapshot) {
      isFirstSnapshot = false;
      const hasInitialized = await AsyncStorage.getItem(SYNC_INITIALIZED_KEY);
      if (hasInitialized) {
        console.log("⏩ Skipping initial snapshot processing - using existing data");
        return;
      }
    }

    for (const change of snapshot.docChanges()) {
      const docId = change.doc.id;
      const data = change.doc.data();

      try {
        if (change.type === "added") {
          // Check if document already exists to avoid duplicates
          const existing = await drizzleDb
            .select()
            .from(shopSearchList)
            .where(eq(shopSearchList.docId, docId))
            .all();

          if (existing.length === 0) {
            await drizzleDb.insert(shopSearchList).values({
              docId: docId,
              shopId: data.shopId,
              shopTitle: data.shopTitle,
            });
            console.log(`📝 Added document: ${docId}`);
          } else {
            console.log(`⏩ Document ${docId} already exists, skipping`);
          }
        } else if (change.type === "modified") {
          await drizzleDb
            .update(shopSearchList)
            .set({
              shopId: data.shopId,
              shopTitle: data.shopTitle,
            })
            .where(eq(shopSearchList.docId, docId));
          console.log(`🔄 Updated document: ${docId}`);
        } else if (change.type === "removed") {
          await drizzleDb.delete(shopSearchList).where(eq(shopSearchList.docId, docId));
          console.log(`❌ Removed document: ${docId}`);
        }
      } catch (error) {
        console.error(`Error processing ${change.type} for ${docId}:`, error);
      }
    }
  });
};

// Utility function to clear the table
const clearShopSearchList = async () => {
  const sqliteDb = await initializeDatabase();
  const drizzleDb = drizzle(sqliteDb);

  console.log("🧹 Clearing shopSearchList table");
  await drizzleDb.delete(shopSearchList);
  console.log("🧹 shopSearchList table cleared");
};

// For development: Clear all sync state (use when testing)
export const resetSyncState = async () => {
  if (globalUnsubscribe) {
    globalUnsubscribe();
    globalUnsubscribe = null;
  }
  await AsyncStorage.removeItem(SYNC_INITIALIZED_KEY);
  await AsyncStorage.removeItem(LISTENER_ACTIVE_KEY);
  await clearShopSearchList();
  console.log("🔄 Sync state reset completely");
};
