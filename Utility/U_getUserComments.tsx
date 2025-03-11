import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
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
  lastDoc?: QueryDocumentSnapshot | null;
  limitCount?: number;
  initialLoad?: boolean;
}): Promise<{ comments: Rating[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    console.log("\n\nLastDoc: ", lastDoc?.id);
    // Reference to the comments sub collection
    const shopDocRef = doc(db, "Users", userId, "Shop", "ShopPageInfo");
    const ratingsRef = collection(shopDocRef, "UserComments");

    // Build query: order by 'date' and limit to 5 documents
    let ratingsQuery;

    if (initialLoad || !lastDoc) {
      ratingsQuery = query(ratingsRef, orderBy("Timestamp", "desc"), limit(limitCount));
    } else {
      ratingsQuery = query(
        ratingsRef,
        orderBy("Timestamp", "desc"),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(ratingsQuery);

    const comments: Rating[] = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    console.log("\nComments: ", comments);

    // Store the last document snapshot for pagination
    const newLastDoc =
      querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

    return { comments, lastDoc: newLastDoc };
  } catch (error) {
    console.error("Error fetching comments: ", error);
    throw error;
  }
};
