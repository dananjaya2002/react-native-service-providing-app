// root/interfaces/UserData.ts
import { doc } from "firebase/firestore";

export interface UserData {
  userId: string;
  isServiceProvider: boolean;
  password: string;
  userName: string;
  favorites: string[];
}
