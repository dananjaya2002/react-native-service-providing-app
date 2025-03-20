import React, { useState, useRef, useCallback } from "react";
import {
  FlatList,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { uploadImageToCloud } from "../../Utility/u_uploadImageNew";

import { useChat } from "../../hooks/useChat";
import ChatMessageItem from "@/components/section2/ChatMessageItem";

export type MessageTypes = "textMessage" | "imageURL" | "AgreementRequest";

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

  const handleSendTextMessage = useCallback(async () => {
    if (!currentMessage.trim()) return;
    const textMessage = currentMessage.trim();
    setCurrentMessage("");
    await sendMessage({ messageType: "textMessage", value: textMessage });
  }, [currentMessage, sendMessage]);

  const handleSendImageMessage = useCallback(
    async (imageUri: string) => {
      try {
        const imageUrl = await uploadImageToCloud(imageUri);
        if (!imageUrl) {
          console.error("Image upload failed");
          return;
        }
        await sendMessage({ messageType: "imageURL", value: imageUrl });
      } catch (error) {
        console.error("Error sending image message:", error);
      }
    },
    [sendMessage]
  );

  const handleImageSelection = useCallback(async () => {
    Keyboard.dismiss();
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
    if (result.canceled) {
      return;
    }
    const imageUri = result.assets[0].uri;
    await handleSendImageMessage(imageUri);
  }, [handleSendImageMessage]);

  const renderChatMessage = useCallback(
    ({ item }: { item: any }) => <ChatMessageItem item={item} userID={userID} />,
    [userID]
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
        {/* Image button on the left */}
        <TouchableOpacity onPress={handleImageSelection} style={styles.imageButton}>
          <Ionicons name="image-outline" size={24} color="#333" />
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
  imageButton: {
    marginRight: 8,
    padding: 4,
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
