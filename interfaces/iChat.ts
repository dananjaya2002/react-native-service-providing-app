// root/interfaces/iChat.ts

export interface ShopDataForCharRoomCreating {
  serviceProviderUserID: string;
  shopName: string;
  shopProfileImageUrl: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  textChat?: string;
  imageUrl?: string;
  timestamp?: any;
  status: "pending" | "sent" | "error";
}
