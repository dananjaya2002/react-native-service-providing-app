import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import fs from "fs"; // Import the 'fs' module

// interface RatingData {
//   id: string;
//   comments: string;
//   date: Date;
//   name: string;
//   ratings: number;
//   profileImageUrl: string;
//   // For example:
//   // name: string;
//   // rating: number;
// }
let cachedShopPageData: any = null;

export const getShopPageData = async () => {
  if (cachedShopPageData) {
    console.warn(" ⚠️  Using cached shop page data. ⚠️ ");
    return cachedShopPageData;
  }

  if (!db) {
    console.warn("❌ Firestore is invalid.");
    return null;
  }

  try {
    console.warn("Getting Shop Page Data from Firebase 🔄");

    // Fetch the main document data
    const docRef = doc(db, "Users/user1/Shop", "shopPageInfo");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn("Shop page info not found.");
      return null;
    }
    const shopData = docSnap.data();

    // // Fetch the Ratings subcollection using the document reference
    // const ratingsRef = collection(docRef, "Ratings");
    // const querySnapshot = await getDocs(ratingsRef);
    // const ratingsData: any[] = [];
    // querySnapshot.forEach((doc) => {
    //   ratingsData.push({ id: doc.id, ...doc.data() });
    // });

    // // Combine the shop page info with the ratings
    // const data = { ...shopData, ratings: ratingsData };

    // Cache the data so subsequent calls use this value during development
    cachedShopPageData = shopData;
    return shopData;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return null;
  }
};
