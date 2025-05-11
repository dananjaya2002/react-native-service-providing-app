// (tab)/chat/personalChat.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../../../../FirebaseConfig";
import { Timestamp, DocumentReference } from "firebase/firestore";
import { UserStorageService } from "../../../../storage/functions/userStorageService";
// Define types
import { UserData, UserInfo } from "../../../../interfaces/UserData";
import { ChatRoom } from "../../../../interfaces/iChat";
// type UserInfo = {
//   docRef: DocumentReference; // Reference to the user document in Firestore
//   name: string;
//   profileImageUrl: string;
// };

// type ChatRoom = {
//   id: string;
//   customerRef: string;
//   serviceProvider: UserInfo;
//   customer: UserInfo;
//   name?: string;
//   lastMessage?: string;
//   timestamp?: Timestamp;
// };

/**
 * User's Shop Chat Page
 */

export default function ChatList() {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userDocRefID, setUserDocRefID] = useState<string | null>(null);

  const userRoleDocFieldPath = "serviceProvider.docRef";

  // Fetch saved user data asynchronously
  useEffect(() => {
    async function fetchUserData() {
      try {
        const savedUserData = (await UserStorageService.getUserData()) as UserData;
        setUserDocRefID(savedUserData.userId);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUserData();
  }, []);

  /**
   *
   * Fetch Data from the firebase
   *
   */
  useEffect(() => {
    if (!userDocRefID) {
      // Don't run query until we have a valid userDocRefID
      return;
    }

    // Indicate loading has started
    setIsLoading(true);

    const chatCollectionRef = collection(db, "Chat");
    const chatQuery = query(chatCollectionRef, where(userRoleDocFieldPath, "==", userDocRefID));
    // Attach the real-time listener
    const unsubscribe = onSnapshot(
      chatQuery,
      (chatSnapshot) => {
        // Map over documents to build chat rooms with latest message info
        const chatRooms = chatSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatRoom[];

        setChatRooms(chatRooms);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching chat rooms:", error);
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
    //router.push(`/chat/chatUi?chatRoomDocRefId=${chatRoom}`);

    try {
      router.push({
        pathname: "/(tabs)/chat/chatWindow/chatUi",
        params: {
          userID: userDocRefID,
          chatRoomDocRefId: chatRoom,
          userRole: "serviceProvider",
          otherPartyUserId,
        },
      });
    } catch (error) {
      console.error("Error navigating to chat:", error);
      Alert.alert("Navigation Error", "Failed to navigate to the chat room. Please try again.");
    }
  };

  // Render each chat item
  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    let otherUserName = item.customer.name;
    let otherUserProfilePicURL = item.customer.profileImageUrl;
    let timestampText;

    // Converting Time
    if (!item.timestamp) {
      timestampText = "Just now";
    } else if (typeof item.timestamp === "string") {
      timestampText = item.timestamp;
      console.log("\n\nis timestampText: ", typeof item.timestamp === "string");
    } else {
      const date = item.timestamp.toDate();
      const today = new Date();

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      if (isToday) {
        timestampText = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else {
        timestampText = date.toLocaleDateString();
      }
    }
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => {
          navigateToChat(item.id, item.customer.docRef);
        }}
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
            {item.lastMessage === "<Agreement Requested>"
              ? "Agreement Sent"
              : item.lastMessage?.startsWith("http")
              ? "Image"
              : item.lastMessage || "No messages yet"}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.chatTimestamp}>{timestampText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // --------------  Main UI rendering Section --------------

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
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
