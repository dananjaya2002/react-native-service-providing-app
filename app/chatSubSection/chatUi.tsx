import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../FirebaseConfig"; // Ensure Firebase is configured
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { uploadImageToCloud } from "../../Utility/u_uploadImageNew";

// Receive Message Format
interface ChatMessage {
  id: string; // Firestore doc.id
  senderId: string;
  textChat?: string;
  imageUrl?: string;
  timestamp?: any;
}
type RouterParams = {
  userID: string;
  chatRoomDocRefId: string;
};

type SendingChat = {
  senderId: string;
  textChat?: string;
  imageUrl?: string;
  timestamp: any;
};

const PAGE_SIZE = 10; // Number of messages to load per page

export default function ChatScreen() {
  const chatListRef = useRef<FlatList>(null);
  const { chatRoomDocRefId, userID } = useLocalSearchParams<RouterParams>();
  if (!chatRoomDocRefId || !userID) return null; // Prevent crashes

  // Main Chat message array
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // User input message state
  const [currentMessage, setCurrentMessage] = useState("");
  // Load More chat messages
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  // To prevent scroll down when user is scrolling up to view old messages
  const [shouldScroll, setShouldScroll] = useState(true);

  const messagesRefDevOnly = useRef<ChatMessage[]>([]); // dev only

  /**
   *
   * Helper Functions
   *
   */

  // Fetch data from Firestore
  useEffect(() => {
    // Use cached chat rooms if available
    if (messagesRefDevOnly.current.length > 0) {
      console.log("✅ Using cached chat rooms");
      setChatMessages(messagesRefDevOnly.current);
      setLoadingMore(false);
      return;
    }
    if (!chatRoomDocRefId) return;

    const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
    const initialQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(PAGE_SIZE));

    const unsubscribe = onSnapshot(initialQuery, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];

      messagesRefDevOnly.current = messages; // Dev only

      setChatMessages(messages);
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [chatRoomDocRefId]);

  // Load more messages from Firestore
  const loadMoreMessages = async () => {
    console.log("\nLoading more messages...");
    if (!lastDoc || loadingMore) return; // Prevent duplicate loads
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
      })) as ChatMessage[];

      if (snapshot.docs.length > 0) {
        setChatMessages((prevMessages) => [...prevMessages, ...moreMessages]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setLastDoc(null); // If No more messages to load
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    }

    setLoadingMore(false);
  };

  // Scroll to bottom on initial load
  useEffect(() => {
    if (chatMessages.length > 0) {
      chatListRef.current?.scrollToIndex({ index: 0, animated: false }); // No animation on first load
    }
  }, []);

  // Trigger scroll down when new message is added
  useEffect(() => {
    if (shouldScroll && chatMessages.length > 0) {
      chatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  }, [chatMessages, shouldScroll]);

  // Send message to Firestore
  const sendMessages = async (message: SendingChat) => {
    try {
      const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
      const batch = writeBatch(db);
      // Create a new message document reference and add the message
      const newMessageRef = doc(messagesRef);
      batch.set(newMessageRef, message);
      // Reference to the parent Chat document
      const chatDocRef = doc(db, "Chat", chatRoomDocRefId);
      // Update the parent document with latest message details
      batch.update(chatDocRef, {
        lastMessage: message.textChat || message.imageUrl,
        timestamp: message.timestamp || new Date(),
      });
      // Commit the batch
      await batch.commit();
      setCurrentMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  /**
   *
   * ------------------------------------------------------------------------------------
   *
   */

  /**
   * Handle Send Text Message
   */
  const handleSendTextMessage = async () => {
    // Ignore empty messages
    if (!currentMessage.trim()) return;

    const newMessage = {
      senderId: userID,
      textChat: currentMessage.trim(),
      timestamp: serverTimestamp(),
    };

    await sendMessages(newMessage);
  };

  /**
   * Pick Image
   */
  const handleImageSelection = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Camera roll permissions required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      handleSendImageMessage(imageUri);
    }
  };

  /**
   * Send Image Message
   */
  const handleSendImageMessage = async (imageUri: string) => {
    try {
      const imageUrl = await uploadImageToCloud(imageUri);
      if (!imageUrl) {
        console.error("Image upload failed");
        return;
      }
      const newMessage: SendingChat = {
        senderId: userID,
        imageUrl: imageUrl,
        timestamp: serverTimestamp(),
      };

      await sendMessages(newMessage);
    } catch (error) {
      console.error("Error sending image message:", error);
    }
  };

  /**
   * Render Messages
   */
  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === userID ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
      ) : (
        <Text
          style={[
            styles.messageText,
            item.senderId === userID ? styles.sentMessageText : styles.receivedMessageText,
          ]}
        >
          {item.textChat}
        </Text>
      )}
      <Text
        style={[
          styles.messageTimestamp,
          item.senderId === userID ? styles.sentMessageTimestamp : null,
        ]}
      >
        {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString() : "Now"}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2F3F4" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 30}
    >
      <TouchableOpacity style={styles.dataFetchButton} onPress={() => {}}>
        <Text style={styles.dataFetchButtonText}>Fetch Data</Text>
      </TouchableOpacity>

      <FlatList
        ref={chatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderChatMessage}
        inverted
        contentContainerStyle={styles.chatListContainer}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.1}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          // If the offset is low, assume the user is near the bottom
          if (offsetY < 50) {
            setShouldScroll(true);
            console.log("User is near the bottom");
          } else {
            setShouldScroll(false);
            console.log("User is scrolling up");
          }
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.messageInputContainer}>
        {/* {isUserTyping && (
          <ActivityIndicator style={styles.typingIndicator} size="small" color="#888" />
        )} */}

        <TouchableOpacity onPress={handleImageSelection} style={styles.imageButtonContainer}>
          <MaterialIcons name="image" size={24} color="#333" />
        </TouchableOpacity>

        <TextInput
          style={styles.messageInputField}
          value={currentMessage}
          placeholder="Type your message"
          onChangeText={setCurrentMessage}
          onSubmitEditing={handleSendTextMessage}
        />

        <TouchableOpacity
          onPress={handleSendTextMessage}
          disabled={!currentMessage.trim()}
          style={[styles.sendButton, { opacity: currentMessage.trim() ? 1 : 0.5 }]}
        >
          <Ionicons name="send" size={30} color="#333" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F2F3F4",
  },
  dataFetchButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dataFetchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  messageInputContainer: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  imageButtonContainer: {
    marginRight: 10,
    padding: 8,
    borderRadius: 8,
  },
  messageInputField: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sendButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  messageContainer: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
    // Add subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0d6efd",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e9ecef",
  },
  sentMessageText: {
    fontSize: 16,
    color: "#fff",
  },
  receivedMessageText: {
    fontSize: 16,
    color: "#333",
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 6,
  },
  sentMessageTimestamp: {
    color: "rgba(255,255,255,0.8)",
  },
  chatListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  typingIndicator: {
    marginRight: 10,
  },
  disabledSendButton: {
    color: "#ccc",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 5,
  },
});
