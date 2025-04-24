// root/interfaces/UserData.ts
import { doc, DocumentReference } from "firebase/firestore";
import { ShopList } from "./iShop";

export interface UserData {
  userId: string;
  isServiceProvider: boolean;
  userName: string;
  profileImageUrl: string;
}

export interface UserInfo {
  docRef: string; // Reference to the user document in Firestore
  name: string;
  profileImageUrl: string;
}
