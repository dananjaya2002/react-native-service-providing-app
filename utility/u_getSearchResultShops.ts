import { collection, doc, getDoc } from "firebase/firestore";
import { ShopSearchBarItem, ShopList } from "../interfaces/iShop";
import { db } from "../FirebaseConfig"; // Adjust the path to your Firebase config

/**
 * Fetches ShopList documents from Firebase based on the doc_id of ShopSearchBarItem.
 * @param searchItems - Array of ShopSearchBarItem containing doc_id to search for.
 * @returns Promise<ShopList[]> - Array of ShopList items.
 */
export const getSearchResultShops = async (
  searchItems: ShopSearchBarItem[]
): Promise<ShopList[]> => {
  // Remove duplicate doc_id entries
  const uniqueSearchItems = Array.from(
    new Map(searchItems.map((item) => [item.doc_id, item])).values()
  );

  const shopListCollectionRef = collection(db, "/ShopList");
  const shopList: ShopList[] = [];

  for (const searchItem of uniqueSearchItems) {
    try {
      const docRef = doc(shopListCollectionRef, searchItem.doc_id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const shopData = docSnap.data() as ShopList;
        shopList.push(shopData);
      } else {
        console.warn(`Document with ID ${searchItem.doc_id} does not exist.`);
      }
    } catch (error) {
      console.error(`Error fetching document with ID ${searchItem.doc_id}:`, error);
    }
  }

  return shopList;
};
