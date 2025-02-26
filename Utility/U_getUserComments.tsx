import { collection, doc, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../FirebaseConfig";

/**
 * Fetch ratings with pagination.
 * @param lastDoc - The last document from the previous query.
 * @param limitCount - Number of documents to fetch per query.
 * @param initialLoad - Whether this is the initial load.
 * @returns An object containing the ratings and the last document snapshot.
 */

export const fetchRatings = async ({
  lastDoc = null,
  limitCount = 1,
  initialLoad = false,
}: {
  lastDoc?: any;
  limitCount?: number;
  initialLoad?: boolean;
}): Promise<{ ratings: any[]; lastDoc: any }> => {
  try {
    // Reference to the Ratings subcollection
    const shopDocRef = doc(db!, "Users/user1/Shop", "shopPageInfo");
    const ratingsRef = collection(shopDocRef, "Ratings");

    // Build query: order by 'date' and limit to 5 documents
    let ratingsQuery;
    if (initialLoad || !lastDoc) {
      ratingsQuery = query(ratingsRef, orderBy("Date"), limit(limitCount));
    } else {
      ratingsQuery = query(ratingsRef, orderBy("Date"), startAfter(lastDoc), limit(limitCount));
    }

    const querySnapshot = await getDocs(ratingsQuery);
    const newRatings: any[] = [];
    querySnapshot.forEach((doc) => {
      newRatings.push({ id: doc.id, ...doc.data() });
    });

    // Save the last visible document snapshot
    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { ratings: newRatings, lastDoc: newLastDoc };
  } catch (error) {
    console.error("Error fetching ratings: ", error);
    throw error;
  }
};
