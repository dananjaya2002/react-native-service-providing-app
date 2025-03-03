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
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../FirebaseConfig"; // Ensure Firebase is configured
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

// Define Message Format
interface ChatMessage {
  id: string; // Firestore doc.id
  senderId: string;
  text?: string;
  image?: string;
  timestamp?: any;
}
type RouterParams = {
  userID: string; // Or number, or whatever type userID is
  chatRoomDocRefId: string;
};

const PAGE_SIZE = 20;

export default function ChatScreen() {
  const chatListRef = useRef<FlatList>(null);
  const { chatRoomDocRefId, userID } = useLocalSearchParams<RouterParams>();

  // Main Chat message array
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // User input message state
  const [currentMessage, setCurrentMessage] = useState("");

  // Fetch data from Firestore
  useEffect(() => {
    if (!chatRoomDocRefId) return;

    const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
    const q = query(messagesRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];

      setChatMessages(messages);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [chatRoomDocRefId]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (chatMessages.length > 0) {
      chatListRef.current?.scrollToIndex({ index: 0, animated: false }); // No animation on first load
    }
  }, []);

  // trigger scroll down when new message is added
  useEffect(() => {
    if (chatMessages.length > 0) {
      chatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  }, [chatMessages]);

  /**
   * Send Text Message
   */
  const handleSendTextMessage = async () => {
    // Ignore empty messages
    if (!currentMessage.trim()) return;

    const newMessage = {
      senderId: userID,
      text: currentMessage.trim(),
      timestamp: serverTimestamp(),
    };

    try {
      const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
      console.log("Sending message:", newMessage);
      console.log("\nMessages Ref:", messagesRef);
      console.log("\nChat Room Doc Ref:", chatRoomDocRefId);
      await addDoc(messagesRef, newMessage);
      setCurrentMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  /**
   * Pick Image & Send
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
      quality: 1,
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
    const newMessage: ChatMessage = {
      id: String(Date.now()),
      senderId: userID,
      image: imageUri,
      timestamp: new Date(), // Simulate timestamp
    };

    setChatMessages((prevMessages) => [newMessage, ...prevMessages]);
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
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.messageImage} />
      ) : (
        <Text
          style={[
            styles.messageText,
            item.senderId === userID ? styles.sentMessageText : styles.receivedMessageText,
          ]}
        >
          {item.text}
        </Text>
      )}
      <Text
        style={[
          styles.messageTimestamp,
          item.senderId === userID ? styles.sentMessageTimestamp : null,
        ]}
      >
        {item.timestamp instanceof Date ? item.timestamp.toLocaleTimeString() : "Now"}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
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
      />

      <View style={styles.messageInputContainer}>
        {/* {isUserTyping && (
          <ActivityIndicator style={styles.typingIndicator} size="small" color="#888" />
        )} */}

        <TouchableOpacity onPress={handleImageSelection} style={styles.imageButtonContainer}>
          <MaterialIcons name="image" size={24} color="#007BFF" />
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
    marginTop: 50,
  },
  dataFetchButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    zIndex: 1, // Ensure it's above other components
  },
  dataFetchButtonText: {
    color: "white",
    fontSize: 16,
  },
  messageInputContainer: {
    height: 70,
    backgroundColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  imageButtonContainer: {
    marginRight: 10,
    padding: 10,
    backgroundColor: "#aee",
    borderRadius: 5,
  },
  messageInputField: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 10,
  },
  sendButton: {
    // No style changes for the button itself, opacity handled directly inline
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  messageText: {
    fontSize: 16,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007BFF",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ddd",
  },
  sentMessageText: {
    fontSize: 16,
    color: "white",
  },
  receivedMessageText: {
    fontSize: 16,
    color: "#333",
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#aaa",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  sentMessageTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  chatListContainer: {
    paddingHorizontal: 10,
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
    borderRadius: 10,
    marginBottom: 5,
  },
});
