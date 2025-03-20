// hooks/useChatMessages.ts
import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

export interface ChatMessage {
  id: string;
  senderId: string;
  textChat?: string;
  imageUrl?: string;
  // Confirmed messages will have a timestamp, but optimistic ones have null (so UI can show a loading icon)
  timestamp: any | null;
  status: "pending" | "sent" | "error";
}

const PAGE_SIZE = 10;

export function useChatMessages(chatRoomDocRefId: string) {
  const [remoteMessages, setRemoteMessages] = useState<ChatMessage[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Subscribe to remote messages from Firebase.
  useEffect(() => {
    if (!chatRoomDocRefId) return;
    const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
    const initialQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(PAGE_SIZE));
    const unsubscribe = onSnapshot(initialQuery, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: "sent", // remote messages are confirmed
      })) as ChatMessage[];
      setRemoteMessages(messages);
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    });
    return () => unsubscribe();
  }, [chatRoomDocRefId]);

  // Pagination: load more messages
  const loadMoreMessages = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
      const moreQuery = query(
        messagesRef,
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(moreQuery);
      const moreMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: "sent",
      })) as ChatMessage[];
      setRemoteMessages((prev) => [...prev, ...moreMessages]);
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setLastDoc(null);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
    setLoadingMore(false);
  };

  // Add an optimistic message (for sending)
  const addOptimisticMessage = (message: ChatMessage) => {
    setOptimisticMessages((prev) => [message, ...prev]);
  };

  // Update an optimistic message’s status (and optionally timestamp) when confirmed or failed.
  const updateOptimisticMessageStatus = (
    messageId: string,
    newStatus: "sent" | "error",
    newTimestamp?: any
  ) => {
    setOptimisticMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, status: newStatus, timestamp: newTimestamp ?? msg.timestamp }
          : msg
      )
    );
  };

  // Merge remote and optimistic messages into one array.
  // If a pending optimistic message exists, it takes precedence.
  const mergedMessages = useMemo(() => {
    const messagesMap = new Map<string, ChatMessage>();
    // First, add all remote messages.
    remoteMessages.forEach((msg) => messagesMap.set(msg.id, msg));
    // Then, override with optimistic messages if they are still pending.
    optimisticMessages.forEach((msg) => {
      // Only override if the optimistic message is pending.
      if (msg.status === "pending") {
        messagesMap.set(msg.id, msg);
      }
    });
    // Convert the map to an array and sort by timestamp descending.
    return Array.from(messagesMap.values()).sort((a, b) => {
      const tA = a.timestamp
        ? a.timestamp.toMillis
          ? a.timestamp.toMillis()
          : new Date(a.timestamp).getTime()
        : 0;
      const tB = b.timestamp
        ? b.timestamp.toMillis
          ? b.timestamp.toMillis()
          : new Date(b.timestamp).getTime()
        : 0;
      return tB - tA;
    });
  }, [remoteMessages, optimisticMessages]);

  return {
    messages: mergedMessages,
    loadMoreMessages,
    addOptimisticMessage,
    updateOptimisticMessageStatus,
    loadingMore,
  };
}
