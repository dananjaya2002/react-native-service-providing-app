// hooks/useChat.ts
import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

export type MessageTypes = "textMessage" | "imageURL" | "AgreementRequest";

export interface ChatMessage {
  id: string;
  senderId: string;
  messageType: MessageTypes;
  value: string;
  // Use a proper timestamp type if available, otherwise keep as any.
  timestamp: any | null;
  status: "pending" | "sent" | "error";
}

const PAGE_SIZE = 10;

export function useChat(chatRoomDocRefId: string, userID: string) {
  const [chatArray, setChatArray] = useState<ChatMessage[]>([]);
  const [notUploadedMessages, setNotUploadedMessages] = useState<ChatMessage[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Subscribe to confirmed messages from Firestore.
  useEffect(() => {
    if (!chatRoomDocRefId) return;
    const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(PAGE_SIZE));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: "sent" as "sent",
      })) as ChatMessage[];

      // Merge fetched messages with existing chatArray.
      setChatArray((prev) => {
        const map = new Map<string, ChatMessage>();
        prev.forEach((msg) => map.set(msg.id, msg));
        fetched.forEach((msg) => {
          const existing = map.get(msg.id);
          if (!existing || existing.status !== "pending") {
            map.set(msg.id, msg);
          }
        });
        return Array.from(map.values()).sort((a, b) => {
          const timeA = a.timestamp
            ? a.timestamp.toMillis
              ? a.timestamp.toMillis()
              : new Date(a.timestamp).getTime()
            : 0;
          const timeB = b.timestamp
            ? b.timestamp.toMillis
              ? b.timestamp.toMillis()
              : new Date(b.timestamp).getTime()
            : 0;
          return timeB - timeA;
        });
      });
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    });
    return () => unsubscribe();
  }, [chatRoomDocRefId]);

  // Pagination: load more messages.
  const loadMoreMessages = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
      const q = query(
        messagesRef,
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: "sent" as "sent",
      })) as ChatMessage[];
      setChatArray((prev) => {
        const map = new Map<string, ChatMessage>(prev.map((msg) => [msg.id, msg]));
        fetched.forEach((msg) => map.set(msg.id, msg));
        return Array.from(map.values()).sort((a, b) => {
          const timeA = a.timestamp
            ? a.timestamp.toMillis
              ? a.timestamp.toMillis()
              : new Date(a.timestamp).getTime()
            : 0;
          const timeB = b.timestamp
            ? b.timestamp.toMillis
              ? b.timestamp.toMillis()
              : new Date(b.timestamp).getTime()
            : 0;
          return timeB - timeA;
        });
      });
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
    setLoadingMore(false);
  };

  // Send a message.
  const sendMessage = async (data: { messageType: MessageTypes; value: string }) => {
    const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
    const newMessageRef = doc(messagesRef);
    const messageId = newMessageRef.id;

    // Create an optimistic message with a provisional timestamp.
    const optimisticMsg: ChatMessage = {
      id: messageId,
      senderId: userID,
      messageType: data.messageType,
      value: data.value,
      timestamp: new Date(), // provisional timestamp
      status: "pending",
    };

    // Add the optimistic message.
    setChatArray((prev) => [optimisticMsg, ...prev]);
    setNotUploadedMessages((prev) => [...prev, optimisticMsg]);

    try {
      const messageData: any = {
        senderId: userID,
        messageType: data.messageType,
        value: data.value,
        timestamp: serverTimestamp(),
      };

      const batch = writeBatch(db);
      batch.set(newMessageRef, messageData);
      const chatDocRef = doc(db, "Chat", chatRoomDocRefId);
      batch.update(chatDocRef, {
        lastMessage: data.value,
        timestamp: serverTimestamp(),
      });
      await batch.commit();

      // On success, update status to "sent".
      setChatArray((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "sent" } : msg))
      );
      setNotUploadedMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Error sending message:", error);
      // On failure, mark as error.
      setChatArray((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "error" } : msg))
      );
      setNotUploadedMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "error" } : msg))
      );
    }
  };

  return {
    chatArray,
    loadMoreMessages,
    sendMessage,
    notUploadedMessages,
    loadingMore,
  };
}
