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
import { QueryDocumentSnapshot, DocumentData, Timestamp } from "firebase/firestore";
import { uploadImageToCloud } from "../../Utility/u_uploadImageNew";

import { useChatMessages } from "../../hooks/useChatMessages";
import { useSendMessage } from "../../hooks/useSendMessage";
import { useChat } from "../../hooks/useChat";
import ChatMessageItem from "@/components/section2/ChatMessageItem";

// Receive Message Format
interface ChatMessage {
  id: string; // Firestore doc.id
  senderId: string;
  textChat?: string;
  imageUrl?: string;
  timestamp?: any;
  status: "pending" | "sent" | "error";
}
type RouterParams = {
  userID: string;
  chatRoomDocRefId: string;
};

type SendingChat = {
  id: string;
  senderId: string;
  textChat?: string;
  imageUrl?: string;
  timestamp: any;
  status: "pending" | "sent" | "error";
};

const PAGE_SIZE = 10; // Number of messages to load per page

export default function ChatScreen() {
  const chatListRef = useRef<FlatList>(null);
  const { chatRoomDocRefId, userID } = useLocalSearchParams<{
    chatRoomDocRefId: string;
    userID: string;
  }>();
  const [currentMessage, setCurrentMessage] = useState("");

  const { chatArray, loadMoreMessages, sendMessage, loadingMore } = useChat(
    chatRoomDocRefId,
    userID
  );

  const handleSendTextMessage = async () => {
    if (!currentMessage.trim()) return;
    setCurrentMessage("");
    await sendMessage({ textChat: currentMessage.trim() });
  };

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

  const handleSendImageMessage = async (imageUri: string) => {
    try {
      const imageUrl = await uploadImageToCloud(imageUri);
      if (!imageUrl) {
        console.error("Image upload failed");
        return;
      }
      // Use sendMessage for image messages as well.
      await sendMessage({ imageUrl });
    } catch (error) {
      console.error("Error sending image message:", error);
    }
  };

  const renderChatMessage = ({ item }: { item: any }) => (
    <ChatMessageItem item={item} userID={userID} />
  );
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2F3F4" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 30}
    >
      <FlatList
        ref={chatListRef}
        data={chatArray}
        keyExtractor={(item) => item.id}
        renderItem={renderChatMessage}
        inverted
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.1}
      />
      <View style={styles.messageInputContainer}>
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
});
