// hooks/useSendMessage.ts
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { ChatMessage } from "./useChatMessages";

export interface SendingChat {
  id: string;
  senderId: string;
  textChat?: string;
  imageUrl?: string;
  timestamp: any | null;
  status: "pending" | "sent" | "error";
}

interface UseSendMessageProps {
  chatRoomDocRefId: string;
  userID: string;
  addOptimisticMessage: (message: ChatMessage) => void;
  updateOptimisticMessageStatus: (
    id: string,
    newStatus: "sent" | "error",
    newTimestamp?: any
  ) => void;
}

export function useSendMessage({
  chatRoomDocRefId,
  userID,
  addOptimisticMessage,
  updateOptimisticMessageStatus,
}: UseSendMessageProps) {
  const sendMessage = async (data: { textChat?: string; imageUrl?: string }) => {
    // Create a doc ref to get a consistent ID.
    const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
    const newMessageRef = doc(messagesRef);
    const messageId = newMessageRef.id;

    // Create an optimistic message WITHOUT a local timestamp.
    const optimisticMessage: SendingChat = {
      id: messageId,
      senderId: userID,
      textChat: data.textChat,
      imageUrl: data.imageUrl,
      timestamp: null, // No local timestamp; UI will show a loading indicator.
      status: "pending",
    };

    // Add this message to the unified chat state immediately.
    addOptimisticMessage(optimisticMessage);

    try {
      // Build the message data for Firestore.
      const messageData: any = { senderId: userID, timestamp: serverTimestamp() };
      if (data.textChat !== undefined) messageData.textChat = data.textChat;
      if (data.imageUrl !== undefined) messageData.imageUrl = data.imageUrl;

      const batch = writeBatch(db);
      batch.set(newMessageRef, messageData);
      const chatDocRef = doc(db, "Chat", chatRoomDocRefId);
      batch.update(chatDocRef, {
        lastMessage: data.textChat || data.imageUrl,
        timestamp: serverTimestamp(),
      });
      await batch.commit();

      // On success, update the optimistic message status.
      // The onSnapshot should eventually supply the real timestamp.
      updateOptimisticMessageStatus(messageId, "sent");
    } catch (error) {
      console.error("Error sending message:", error);
      updateOptimisticMessageStatus(messageId, "error");
    }
  };

  return { sendMessage };
}
