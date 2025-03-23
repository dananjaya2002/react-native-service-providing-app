// root/interfaces/UserData.ts
import { doc, DocumentReference } from "firebase/firestore";

export interface UserData {
  userId: string;
  isServiceProvider: boolean;
  password: string;
  userName: string;
  favorites: string[];
}

export interface UserInfo {
  docRef: DocumentReference; // Reference to the user document in Firestore
  name: string;
  profileImageUrl: string;
}
