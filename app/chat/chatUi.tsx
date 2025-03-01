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
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../FirebaseConfig"; // Ensure Firebase is configured

// Define Firestore Message Format
interface ChatMessage {
  id: string; // Firestore doc.id
  type: "send" | "receive";
  text?: string;
  image?: string;
  timestamp?: any;
}

export default function ChatScreen() {
  // State management
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);

  // Get chat room ID from navigation params
  const { chatRoomDocRefId } = useLocalSearchParams<{ chatRoomDocRefId: string }>();
  console.log("Chat Room Doc Ref ID:", chatRoomDocRefId);

  // References
  const chatListRef = useRef<FlatList>(null);

  /**
   * Listen for real-time updates from Firestore
   *
   */

  useEffect(() => {
    if (!chatRoomDocRefId) return;

    const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];

      setChatMessages(messages);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [chatRoomDocRefId]);

  useEffect(() => {
    setIsUserTyping(currentMessage.length > 0);
  }, [currentMessage]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  }, [chatMessages]);

  /**
   * Send Text Message
   */
  const handleSendTextMessage = async () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      type: "send",
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
    const newMessage = {
      type: "send",
      image: imageUri,
      timestamp: serverTimestamp(),
    };

    try {
      const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
      await addDoc(messagesRef, newMessage);
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  /**
   * Render Messages
   */
  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={{
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
        maxWidth: "75%",
        alignSelf: item.type === "send" ? "flex-end" : "flex-start",
        backgroundColor: item.type === "send" ? "#007BFF" : "#ddd",
      }}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={{ width: 200, height: 200, borderRadius: 10 }} />
      ) : (
        <Text style={{ fontSize: 16, color: item.type === "send" ? "white" : "#333" }}>
          {item.text}
        </Text>
      )}
      <Text style={{ fontSize: 12, color: "#aaa", alignSelf: "flex-end", marginTop: 5 }}>
        {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString() : "Now"}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, marginTop: 50 }}>
      <FlatList
        ref={chatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderChatMessage}
        inverted
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
      />

      <View
        style={{ backgroundColor: "#eee", flexDirection: "row", alignItems: "center", padding: 10 }}
      >
        {isUserTyping && (
          <ActivityIndicator style={{ marginRight: 10 }} size="small" color="#888" />
        )}

        <TouchableOpacity onPress={handleImageSelection} style={{ marginRight: 10, padding: 10 }}>
          <MaterialIcons name="image" size={24} color="#007BFF" />
        </TouchableOpacity>

        <TextInput
          style={{
            flex: 1,
            padding: 10,
            fontSize: 16,
            backgroundColor: "#fff",
            borderRadius: 20,
            marginRight: 10,
          }}
          value={currentMessage}
          placeholder="Type your message"
          onChangeText={setCurrentMessage}
          onSubmitEditing={handleSendTextMessage}
        />

        <TouchableOpacity
          onPress={handleSendTextMessage}
          disabled={!currentMessage.trim()}
          style={{ opacity: currentMessage.trim() ? 1 : 0.5 }}
        >
          <Text style={{ fontSize: 18, color: currentMessage.trim() ? "#007BFF" : "#ccc" }}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    marginTop: 50,
  },
  messageInputContainer: {
    backgroundColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  messageInputField: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 10,
  },
  sendButtonText: {
    fontSize: 18,
    color: "#007BFF",
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
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
  imageButtonContainer: {
    marginRight: 10,
    padding: 10,
  },
});
