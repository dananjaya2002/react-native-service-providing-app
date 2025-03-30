// root/Utility/U_createNewChatRoom.tsx
import { addDoc, collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { UserStorageService } from "../storage/functions/userStorageService";
import { Alert } from "react-native";

// interface for typescript
import { UserData } from "../interfaces/UserData";
import { ShopDataForCharRoomCreating } from "../interfaces/iChat";

/**
 * Creates a new chat room in Firestore using the provided shop data and the saved user data.
 *
 * @param shopData - The shop data needed to create the chat room.
 * @returns A promise that resolves with the newly created chat room document ID.
 * @throws Will throw an error if the creation fails.
 */

export const createNewChatRoom = async (shopData: ShopDataForCharRoomCreating): Promise<string> => {
  const savedUserData = (await UserStorageService.getUserData()) as UserData;
  try {
    console.log("Creating chat room with shop data:", shopData, "and user data:", savedUserData);
    const chatCollectionRef = collection(db, "Chat");
    const docRef = await addDoc(chatCollectionRef, {
      serviceProvider: {
        docRef: shopData.serviceProviderUserID,
        name: shopData.shopName,
        profileImageUrl: shopData.shopProfileImageUrl,
      },
      customer: {
        docRef: savedUserData.userId,
        name: savedUserData.userName,
        profileImageUrl: savedUserData.profileImageUrl,
      },
      lastUpdatedTime: Timestamp.now(), // Storing as a Firestore timestamp
    });

    return docRef.id;
  } catch (error) {
    console.error("❌ Failed to create chat room:", error);
    Alert.alert("Error", "Failed to create chat room. Please try again later.");
    throw error;
  }
};
