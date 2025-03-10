import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

interface Rating {
  id: string;
  [key: string]: any;
}

/**
 * Fetch comments with pagination.
 * @param userId - The ID of the user.
 * @param lastDoc - The last document from the previous query.
 * @param limitCount - Number of documents to fetch per query.
 * @param initialLoad - Whether this is the initial load.
 * @returns An object containing the comments and the last document snapshot.
 */

export const fetchUserComments = async ({
  userId,
  lastDoc = null,
  limitCount = 1,
  initialLoad = false,
}: {
  userId: string;
  lastDoc?: DocumentSnapshot | null;
  limitCount?: number;
  initialLoad?: boolean;
}): Promise<{ comments: Rating[]; lastDoc: DocumentSnapshot }> => {
  try {
    // Reference to the comments sub collection
    const shopDocRef = doc(db, "Users", userId, "Shop", "shopPageInfo");
    const ratingsRef = collection(shopDocRef, "Ratings");

    // Build query: order by 'date' and limit to 5 documents
    const ratingsQuery =
      initialLoad || !lastDoc
        ? query(ratingsRef, orderBy("Date"), limit(limitCount))
        : query(ratingsRef, orderBy("Date"), startAfter(lastDoc), limit(limitCount));

    const querySnapshot = await getDocs(ratingsQuery);
    const comments: Rating[] = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Save the last visible document snapshot
    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { comments, lastDoc: newLastDoc };
  } catch (error) {
    console.error("Error fetching comments: ", error);
    throw error;
  }
};
