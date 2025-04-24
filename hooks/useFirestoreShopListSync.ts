// // hooks/useFirestoreShopListSync.ts
// import { useEffect } from "react";
// import { syncFirestoreToLocalDB } from "../db/syncFirestore";

// const useFirestoreShopListSync = () => {
//   useEffect(() => {
//     // Trigger the sync whenever the hook is used, e.g., at app start or on-demand.
//     syncFirestoreToLocalDB();
//   }, []);
// };

// export default useFirestoreShopListSync;

// hooks/useFirestoreShopListSync.ts
import { useEffect } from "react";
import { syncFirestoreToLocalDB } from "../db/syncFirestore";
import { startRealtimeSync } from "@/db/realtimeSync";

const useFirestoreShopListSync = () => {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    async function startSync() {
      unsubscribe = await startRealtimeSync();
    }
    startSync();

    // Cleanup: unsubscribe when component unmounts.
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log("🛑 Firestore realtime sync unsubscribed.");
      }
    };
  }, []);
};

export default useFirestoreShopListSync;
