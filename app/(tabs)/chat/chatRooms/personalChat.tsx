import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../../FirebaseConfig";
import { UserStorageService } from "../../../../storage/functions/userStorageService";
import { UserData } from "../../../../interfaces/UserData";
import { ChatRoom } from "../../../../interfaces/iChat";

export default function ChatList() {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userDocRefID, setUserDocRefID] = useState<string | null>(null);

  const userRoleDocFieldPath = "customer.docRef";

  // Fetch saved user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const savedUserData = (await UserStorageService.getUserData()) as UserData;
        setUserDocRefID(savedUserData.userId);
      } catch (error) {
        Alert.alert("Error", "Failed to load user data. Please try again.");
      }
    }
    fetchUserData();
  }, []);

  // Fetch chat rooms from Firebase
  useEffect(() => {
    if (!userDocRefID) return;

    setIsLoading(true);
    const chatCollectionRef = collection(db, "Chat");
    const chatQuery = query(chatCollectionRef, where(userRoleDocFieldPath, "==", userDocRefID));

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      chatQuery,
      (chatSnapshot) => {
        const chatRooms = chatSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatRoom[];

        setChatRooms(chatRooms);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        Alert.alert(
          "Error",
          error.message || "Failed to fetch chat rooms. Please try again later."
        );
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userDocRefID]);

  // Navigate to chat screen
  const navigateToChat = (chatRoom: string, otherPartyUserId: string) => {
    try {
      router.push({
        pathname: "/(tabs)/chat/chatWindow/chatUi",
        params: {
          userID: userDocRefID,
          chatRoomDocRefId: chatRoom,
          userRole: "customer",
          otherPartyUserId,
        },
      });
    } catch (error) {
      Alert.alert("Navigation Error", "Unable to open the chat. Please try again.");
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return "Just now";
    if (typeof timestamp === "string") return timestamp;

    const date = timestamp.toDate();
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render each chat item
  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    const otherUserName = item.serviceProvider.name;
    const otherUserProfilePicURL = item.serviceProvider.profileImageUrl;
    const timestampText = formatTimestamp(item.timestamp);

    // Format last message for display
    const formatLastMessage = () => {
      if (item.lastMessage === "<Agreement Requested>") return "Agreement Request";
      if (item.lastMessage?.startsWith("http")) return "Image";
      return item.lastMessage || "No messages yet";
    };

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigateToChat(item.id, item.serviceProvider.docRef)}
        accessible={true}
        accessibilityLabel={`Chat with ${otherUserName}`}
      >
        <View style={styles.avatar}>
          <Image
            source={{ uri: otherUserProfilePicURL }}
            resizeMode="cover"
            style={{ width: 50, height: 50, borderRadius: 20 }}
          />
        </View>
        <View style={styles.chatContent}>
          <Text style={styles.chatName}>{otherUserName || "Unknown User"}</Text>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {formatLastMessage()}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.chatTimestamp}>{timestampText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <View>
          <FlatList
            data={chatRooms}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFEFA",
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 16,
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  listContainer: {
    padding: 10,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#F2F3F4",
    borderRadius: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  chatContent: {
    flex: 1,
    marginRight: 10,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 5,
  },
  chatMessage: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  chatMeta: {
    alignItems: "flex-end",
    marginLeft: 20,
  },
  chatTimestamp: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: "#007BFF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
