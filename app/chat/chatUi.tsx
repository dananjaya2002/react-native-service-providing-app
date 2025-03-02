import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
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
import { db } from "../../FirebaseConfig";

// Message type definition
interface ChatMessage {
  id: string;
  type: "send" | "receive";
  text?: string;
  image?: string;
  timestamp?: any;
}

export default function ChatScreen() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const { chatRoomDocRefId } = useLocalSearchParams<{ chatRoomDocRefId: string }>();
  const flatListRef = useRef<FlatList>(null);

  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch messages from Firestore
  useEffect(() => {
    if (!chatRoomDocRefId) return;

    setIsLoading(true);

    try {
      const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ChatMessage[];

          setChatMessages(messages);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching messages:", error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up messages listener:", error);
      setIsLoading(false);
    }
  }, [chatRoomDocRefId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatMessages.length > 0) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [chatMessages]);

  // Send text message
  const handleSendTextMessage = async () => {
    if (!currentMessage.trim() || !chatRoomDocRefId) return;

    try {
      const newMessage = {
        type: "send",
        text: currentMessage.trim(),
        timestamp: serverTimestamp(),
      };

      const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
      await addDoc(messagesRef, newMessage);
      setCurrentMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Handle image selection
  const handleImageSelection = async () => {
    if (!chatRoomDocRefId) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Camera roll permissions required to send images!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        // In a real app, you would upload this to storage first
        // For this example, we'll just use the local URI
        const newMessage = {
          type: "send",
          image: imageUri,
          timestamp: serverTimestamp(),
        };

        const messagesRef = collection(db, `Chat/${chatRoomDocRefId}/Messages`);
        await addDoc(messagesRef, newMessage);
      }
    } catch (error) {
      console.error("Error with image selection:", error);
      alert("Failed to send image. Please try again.");
    }
  };

  // Render a chat message
  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === "send" ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      {item.image ? (
        <View>
          <Image source={{ uri: item.image }} style={styles.messageImage} resizeMode="cover" />
          <Text
            style={[
              styles.messageTimestamp,
              item.type === "send" ? styles.sentTimestamp : styles.receivedTimestamp,
            ]}
          >
            {item.timestamp?.toDate
              ? item.timestamp
                  .toDate()
                  .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Sending..."}
          </Text>
        </View>
      ) : (
        <View>
          <Text style={item.type === "send" ? styles.sentMessageText : styles.receivedMessageText}>
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTimestamp,
              item.type === "send" ? styles.sentTimestamp : styles.receivedTimestamp,
            ]}
          >
            {item.timestamp?.toDate
              ? item.timestamp
                  .toDate()
                  .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Sending..."}
          </Text>
        </View>
      )}
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderChatMessage}
          contentContainerStyle={[
            styles.chatListContent,
            chatMessages.length === 0 && styles.emptyChatList,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          removeClippedSubviews={false}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No messages yet. Start the conversation!</Text>
          }
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={handleImageSelection}
            style={styles.imageButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="image" size={24} color="#007BFF" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={currentMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            onChangeText={setCurrentMessage}
            multiline={true}
            maxLength={1000}
          />

          <TouchableOpacity
            onPress={handleSendTextMessage}
            disabled={!currentMessage.trim()}
            style={[styles.sendButton, !currentMessage.trim() && styles.disabledSendButton]}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={24} color={currentMessage.trim() ? "#007BFF" : "#C7C7CD"} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  chatListContent: {
    padding: 15,
    paddingBottom: 20,
  },
  emptyChatList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 18,
    maxWidth: "80%",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007BFF",
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 4,
  },
  sentMessageText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  receivedMessageText: {
    color: "#000000",
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  messageTimestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  sentTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
    alignSelf: "flex-end",
  },
  receivedTimestamp: {
    color: "#8E8E93",
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  imageButton: {
    padding: 10,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSendButton: {
    opacity: 0.5,
  },
});
