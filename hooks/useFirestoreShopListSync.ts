// hooks/useFirestoreShopListSync.ts
import { useEffect } from "react";
import { syncFirestoreToLocalDB } from "../db/syncFirestore";

const useFirestoreShopListSync = () => {
  useEffect(() => {
    // Trigger the sync whenever the hook is used, e.g., at app start or on-demand.
    syncFirestoreToLocalDB();
  }, []);
};

export default useFirestoreShopListSync;
