// hooks/useChat.ts
import { useState, useEffect, useRef } from "react";
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
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { MessageTypes, ChatMessage, UserRoles } from "../interfaces/iChat";

//export type MessageTypes = "textMessage" | "imageURL" | "AgreementRequest";

// export interface ChatMessage {
//   id: string;
//   senderId: string;
//   messageType: MessageTypes;
//   value: string;
//   // Use a proper timestamp type if available, otherwise keep as any.
//   timestamp: any | null;
//   status: "pending" | "sent" | "error";
// }

const PAGE_SIZE = 10;

export function useChat(chatRoomDocRefId: string, userID: string, userRole: UserRoles) {
  const [chatArray, setChatArray] = useState<ChatMessage[]>([]);
  const [notUploadedMessages, setNotUploadedMessages] = useState<ChatMessage[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [agreementStatus, setAgreementStatus] = useState(false);

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

  /**
   * Checks the agreement status on the chat room document.
   * - If the document has an "agreement" field set to "accepted" and an "acceptedTime" timestamp,
   *   it calculates the difference between the acceptedTime and now.
   * - If the difference is less than 20 minutes, it returns isCommentAvailable = false along with the waitingTime.
   * - If more than 20 minutes have passed, it returns isCommentAvailable = true.
   */
  const checkCommentAvailability = async (): Promise<{
    shouldDisplayCommentUI: boolean;
    waitingTime: number;
  }> => {
    const chatDocRef = doc(db, "Chat", chatRoomDocRefId);
    const chatDocSnap = await getDoc(chatDocRef);

    if (!chatDocSnap.exists()) {
      // Chat document doesn't exist. Since there's no agreement info, treat comments as not available.
      return { shouldDisplayCommentUI: false, waitingTime: 0 };
    }

    const data = chatDocSnap.data();

    // Only proceed if the agreement is "accepted" and acceptedTime exists.
    if (data.agreement !== "accepted" || !data.acceptedTime) {
      return { shouldDisplayCommentUI: false, waitingTime: 0 };
    }

    // Agreement is accepted, so check the acceptedTime difference.
    const acceptedTimeMillis = data.acceptedTime.toMillis
      ? data.acceptedTime.toMillis()
      : new Date(data.acceptedTime).getTime();
    const now = Date.now();
    const diff = now - acceptedTimeMillis;
    const twentyMinutes = 20 * 60 * 1000; // 20 minutes in milliseconds

    if (diff < twentyMinutes) {
      // Comments are not available; return the remaining waiting time.
      return { shouldDisplayCommentUI: true, waitingTime: twentyMinutes - diff };
    }

    // More than 20 minutes have passed.
    return { shouldDisplayCommentUI: true, waitingTime: 0 };
  };

  /**
   *
   *
   * User Online Status and Unread Messages Maintain Section
   *
   *
   */
  const [participantOnlineStatus, setParticipantOnlineStatus] = useState<boolean>(false);

  // Subscribe to participant online status.
  useEffect(() => {
    if (!chatRoomDocRefId) return;

    const participantStatusDocRef = doc(
      db,
      "Chat",
      chatRoomDocRefId,
      "ChatRoomMoreInfo",
      "participantOnlineStatus"
    );

    const unsubscribe = onSnapshot(participantStatusDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        if (userRole === "customer") {
          setParticipantOnlineStatus(docSnapshot.data().serviceProvider as boolean);
        } else if (userRole === "serviceProvider") {
          setParticipantOnlineStatus(docSnapshot.data().customer as boolean);
        }
      } else {
        console.warn("participantOnlineStatus document does not exist.");
      }
    });

    return () => unsubscribe();
  }, [chatRoomDocRefId]);

  // Set the participant online status when the component mounts and unmounts.
  useEffect(() => {
    if (userRole === "customer") {
      updateParticipantOnlineStatus({ customer: true });
    }
    if (userRole === "serviceProvider") {
      updateParticipantOnlineStatus({ serviceProvider: true });
    }

    return () => {
      if (userRole === "customer") {
        updateParticipantOnlineStatus({ customer: false });
      }
      if (userRole === "serviceProvider") {
        updateParticipantOnlineStatus({ serviceProvider: false });
      }
    };
  }, [userRole, chatRoomDocRefId]);

  const updateParticipantOnlineStatus = async (status: {
    customer?: boolean;
    serviceProvider?: boolean;
  }) => {
    if (!chatRoomDocRefId) return;

    try {
      const participantStatusDocRef = doc(
        db,
        "Chat",
        chatRoomDocRefId,
        "ChatRoomMoreInfo",
        "participantOnlineStatus"
      );

      await setDoc(participantStatusDocRef, status, { merge: true });
      console.log("Participant online status updated:", status);
    } catch (error) {
      console.error("Error updating participant online status:", error);
    }
  };

  // ==================================================================================================================
  // Return Section
  // ==================================================================================================================

  return {
    chatArray,
    loadMoreMessages,
    sendMessage,
    notUploadedMessages,
    loadingMore,
    checkCommentAvailability,
    participantOnlineStatus,
  };
}
