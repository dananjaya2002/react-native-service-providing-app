// root/interfaces/iChat.ts

import { UserInfo } from "./UserData";
import { Timestamp, DocumentReference } from "firebase/firestore";

// --------------------------------- //
// --------------------------------- //
// --------------------------------- //
export interface ShopDataForCharRoomCreating {
  serviceProviderUserID: string;
  shopName: string;
  shopProfileImageUrl: string;
}

// export interface ChatMessage {
//   id: string;
//   senderId: string;
//   textChat?: string;
//   imageUrl?: string;
//   timestamp?: any;
//   status: "pending" | "sent" | "error";
// }

export interface MessageType {
  messageType: "textMessage" | "imageURL" | "AgreementRequest";
}

export interface ChatMessage {
  id: string;
  senderId: string;
  messageType: MessageTypes;
  value: string;
  timestamp: Timestamp | null | any;
  status: "pending" | "sent" | "error";
}

export interface ChatRoom {
  id: string;
  customerRef: string;
  serviceProvider: UserInfo;
  customer: UserInfo;
  name?: string;
  lastMessage?: string;
  timestamp?: Timestamp;
}

export type UserRoles = "customer" | "serviceProvider";
export type MessageTypes = "textMessage" | "imageURL" | "AgreementRequest";
