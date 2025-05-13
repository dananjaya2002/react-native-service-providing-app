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
import { MessageTypes, ChatMessage, UserRoles, ChatAgreementTracking } from "../interfaces/iChat";

const PAGE_SIZE = 10;

export function useChat(chatRoomDocRefId: string, userID: string, userRole: UserRoles) {
  // Message state
  const [chatArray, setChatArray] = useState<ChatMessage[]>([]);
  const [notUploadedMessages, setNotUploadedMessages] = useState<ChatMessage[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Agreement and online status
  const [agreementStatus, setAgreementStatus] = useState<ChatAgreementTracking>({
    shouldDisplayCommentUI: false,
    waitingTime: 0,
  });
  const [participantOnlineStatus, setParticipantOnlineStatus] = useState<boolean>(false);

  // Heartbeat mechanism
  const [isHeartbeatActive, setIsHeartbeatActive] = useState(false);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to messages from Firestore
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

      // Merge fetched messages with existing chatArray
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

  // Load more messages (pagination)
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
      // Error is handled gracefully without crashing the app
    } finally {
      setLoadingMore(false);
    }
  };

  // Send a message
  const sendMessage = async (data: { messageType: MessageTypes; value: string }) => {
    const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
    const newMessageRef = doc(messagesRef);
    const messageId = newMessageRef.id;

    // Create an optimistic message with a provisional timestamp
    const optimisticMsg: ChatMessage = {
      id: messageId,
      senderId: userID,
      messageType: data.messageType,
      value: data.value,
      timestamp: new Date(),
      status: "pending",
    };

    // Add the optimistic message
    setChatArray((prev) => [optimisticMsg, ...prev]);
    setNotUploadedMessages((prev) => [...prev, optimisticMsg]);

    try {
      const messageData = {
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

      // On success, update status to "sent"
      setChatArray((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "sent" } : msg))
      );
      setNotUploadedMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      // On failure, mark as error
      setChatArray((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "error" } : msg))
      );
      setNotUploadedMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "error" } : msg))
      );
    }
  };

  // Monitor agreement status
  useEffect(() => {
    if (!chatRoomDocRefId) return;

    const agreementRef = doc(db, "Chat", chatRoomDocRefId, "ChatRoomMoreInfo", "agreement");

    // Real-time listener
    const unsubscribe = onSnapshot(
      agreementRef,
      async () => {
        const availability = await checkCommentAvailability();
        setAgreementStatus(availability);
      },
      () => {
        // Safe fallback on error
        setAgreementStatus({ shouldDisplayCommentUI: false, waitingTime: 0 });
      }
    );

    return () => unsubscribe();
  }, [chatRoomDocRefId]);

  /**
   * Checks if the user can comment based on agreement status
   */
  const checkCommentAvailability = async (): Promise<ChatAgreementTracking> => {
    const chatDocRef = doc(db, "Chat", chatRoomDocRefId, "ChatRoomMoreInfo", "agreement");
    const chatDocSnap = await getDoc(chatDocRef);

    if (!chatDocSnap.exists()) {
      return { shouldDisplayCommentUI: false, waitingTime: 0 };
    }

    const data = chatDocSnap.data();

    // Only proceed if the agreement is "accepted" and acceptedTime exists
    if (data.agreement !== "accepted" || !data.acceptedTime) {
      return { shouldDisplayCommentUI: false, waitingTime: 0 };
    }

    // Calculate time since agreement was accepted
    const acceptedTimeMillis = data.acceptedTime.toMillis
      ? data.acceptedTime.toMillis()
      : new Date(data.acceptedTime).getTime();
    const now = Date.now();
    const diff = now - acceptedTimeMillis;
    const twentyMinutes = 20 * 60 * 1000; // 20 minutes in milliseconds

    if (diff < twentyMinutes) {
      // Comments are visible but waiting time remains
      return { shouldDisplayCommentUI: true, waitingTime: twentyMinutes - diff };
    }

    // More than 20 minutes have passed
    return { shouldDisplayCommentUI: true, waitingTime: 0 };
  };

  // Monitor participant online status
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
        const data = docSnapshot.data();
        const ONLINE_THRESHOLD = 60000; // 60 seconds
        const now = Date.now();

        if (userRole === "customer") {
          // Check service provider status
          const spIsOnline = data.serviceProvider === true;
          const spLastActive = data.serviceProviderLastActive?.toMillis
            ? data.serviceProviderLastActive.toMillis()
            : 0;

          // Consider online only if both flag is true AND last active is recent
          setParticipantOnlineStatus(spIsOnline && now - spLastActive < ONLINE_THRESHOLD);
        } else if (userRole === "serviceProvider") {
          // Check customer status
          const custIsOnline = data.customer === true;
          const custLastActive = data.customerLastActive?.toMillis
            ? data.customerLastActive.toMillis()
            : 0;

          // Consider online only if both flag is true AND last active is recent
          setParticipantOnlineStatus(custIsOnline && now - custLastActive < ONLINE_THRESHOLD);
        }
      } else {
        setParticipantOnlineStatus(false);
      }
    });

    return () => unsubscribe();
  }, [chatRoomDocRefId, userRole]);

  // Update participant online status on mount/unmount
  useEffect(() => {
    if (!chatRoomDocRefId) return;

    if (userRole === "customer") {
      updateParticipantOnlineStatus({
        customer: true,
        customerLastActive: serverTimestamp(),
      });
    }
    if (userRole === "serviceProvider") {
      updateParticipantOnlineStatus({
        serviceProvider: true,
        serviceProviderLastActive: serverTimestamp(),
      });
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

  // Helper function to update online status
  const updateParticipantOnlineStatus = async (status: {
    customer?: boolean;
    serviceProvider?: boolean;
    customerLastActive?: any;
    serviceProviderLastActive?: any;
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
    } catch (error) {
      // Error handled silently to prevent crashes
    }
  };

  // Set up heartbeat mechanism
  useEffect(() => {
    if (!chatRoomDocRefId || !userID) return;

    // Start heartbeat when component mounts
    const startHeartbeat = () => {
      setIsHeartbeatActive(true);

      // Clear any existing interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Set new interval (every 30 seconds)
      heartbeatIntervalRef.current = setInterval(() => {
        if (userRole === "customer") {
          updateHeartbeat({ customerLastActive: serverTimestamp() });
        } else if (userRole === "serviceProvider") {
          updateHeartbeat({ serviceProviderLastActive: serverTimestamp() });
        }
      }, 30000); // 30 seconds interval
    };

    startHeartbeat();

    // Clean up on unmount
    return () => {
      setIsHeartbeatActive(false);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [chatRoomDocRefId, userRole, userID]);

  // Function to update heartbeat timestamp
  const updateHeartbeat = async (heartbeatData: {
    customerLastActive?: any;
    serviceProviderLastActive?: any;
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

      await setDoc(participantStatusDocRef, heartbeatData, { merge: true });
    } catch (error) {
      // Error handled silently to prevent crashes
    }
  };

  return {
    chatArray,
    loadMoreMessages,
    sendMessage,
    notUploadedMessages,
    loadingMore,
    agreementStatus,
    participantOnlineStatus,
  };
}
