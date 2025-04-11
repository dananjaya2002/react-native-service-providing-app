import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  increment,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { IUserRatingsFirebaseDocument, IUserRatingUploadParams } from "../interfaces/iUserRatings";
import { ShopList } from "../interfaces/iShop";
import { UserStorageService } from "../storage/functions/userStorageService"; // Ensure this path matches your project structure

/**
 * Retrieves a ShopList document from the /ShopList/<serviceProviderID> path,
 * and returns it if the document's userDocId matches the provided serviceProviderID.
 */
export const getShopCardData = async (serviceProviderID: string): Promise<ShopList | null> => {
  try {
    console.log("Searching for userDocId:", serviceProviderID);

    // Query the ShopList collection where userDocId matches serviceProviderID
    const shopQuery = query(
      collection(db, "ShopList"),
      where("userDocId", "==", serviceProviderID)
    );

    const querySnapshot = await getDocs(shopQuery);

    if (!querySnapshot.empty) {
      // Assuming there's only one matching document, otherwise adjust logic
      const shopDoc = querySnapshot.docs[0]; // Get the first match
      console.log("Shop document found:", shopDoc.id, shopDoc.data());

      return { id: shopDoc.id, ...shopDoc.data() } as ShopList;
    } else {
      console.error("No matching shop document found for userDocId:", serviceProviderID);
      return null;
    }
  } catch (error) {
    console.error("Error fetching shop card data:", error);
    return null;
  }
};

/**
 * Uploads a user rating and comment, then updates dashboard and ShopList statistics.
 *@param {IUserRatingUploadParams} data - The data required to upload a user rating.
 * @returns true if the entire process succeeds, otherwise false.
 */
export const uploadUserRatings = async (data: IUserRatingUploadParams): Promise<boolean> => {
  try {
    // 1. Retrieve current user data.
    const savedUserData = await UserStorageService.getUserData();
    if (!savedUserData) {
      console.error("User data not found");
      return false;
    }

    // 2. Prepare the new user rating document data.
    const userCommentData: IUserRatingsFirebaseDocument = {
      customerId: savedUserData.userId,
      comment: data.comment,
      name: savedUserData.userName,
      profileImageUrl: savedUserData.profileImageUrl,
      ratings: data.newRating,
      uploadedDate: serverTimestamp(),
    };

    // 3. Add the new comment document to the UserComments subcollection.
    const userCommentsRef = collection(
      db,
      "Users",
      data.serviceProviderID,
      "Shop",
      "ShopPageInfo",
      "UserComments"
    );
    await addDoc(userCommentsRef, userCommentData);

    // 4. Compute the new average rating.
    const newAverageRating =
      (data.avgRatings * data.totalRatings + data.newRating) / (data.totalRatings + 1);

    // 5. Update the ShopPageInfo document:
    //    - Increment dashboardInfo.totalRatings and dashboardInfo.agreements.
    //    - Update dashboardInfo.avgRatings with the new average.
    const shopPageInfoRef = doc(db, "Users", data.serviceProviderID, "Shop", "ShopPageInfo");
    await updateDoc(shopPageInfoRef, {
      "dashboardInfo.totalRatings": increment(1),
      "dashboardInfo.agreements": increment(1),
      "dashboardInfo.avgRatings": newAverageRating,
    });

    // 6. Query the ShopList document where userDocId equals serviceProviderID,
    //    and update its avgRating and totalRatingsCount.
    const shopListQuery = query(
      collection(db, "ShopList"),
      where("userDocId", "==", data.serviceProviderID)
    );
    const shopListSnapshot = await getDocs(shopListQuery);
    shopListSnapshot.forEach(async (docSnap) => {
      const shopListDocRef = doc(db, "ShopList", docSnap.id);
      await updateDoc(shopListDocRef, {
        avgRating: newAverageRating,
        totalRatingsCount: increment(1),
      });
    });

    return true;
  } catch (error) {
    console.error("Error in uploadUserRatings:", error);
    return false;
  }
};
