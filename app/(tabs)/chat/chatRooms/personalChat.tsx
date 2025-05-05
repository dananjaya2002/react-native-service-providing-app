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

/**
 * User's Personal Chat Page'
 */

export default function ChatList() {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userDocRefID, setUserDocRefID] = useState<string | null>(null);

  const userRoleDocFieldPath = "customer.docRef";

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

  //Fetch Data from the firebase
  useEffect(() => {
    if (!userDocRefID) {
      return;
    }
    setIsLoading(true);

    // // Use cached chat rooms if available
    // if (chatRoomsRef.current.length > 0) {
    //   console.log("✅ Using cached chat rooms");
    //   setChatRooms(chatRoomsRef.current);
    //   setIsLoading(false);
    //   return;
    // }

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
    console.log("chatRoom:", chatRoom);
    console.log("otherPartyUserId:", otherPartyUserId);
    console.log("userDocRefID:", userDocRefID);
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
      console.error("Error during navigation:", error);
      Alert.alert("Navigation Error", "Unable to open the chat. Please try again.");
    }
  };

  // Render each chat item
  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    let otherUserName = item.serviceProvider.name;
    let otherUserProfilePicURL = item.serviceProvider.profileImageUrl;
    let timestampText;

    // Converting Time
    if (!item.timestamp) {
      timestampText = "Just now";
    } else if (typeof item.timestamp === "string") {
      timestampText = item.timestamp;
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
          navigateToChat(item.id, item.serviceProvider.docRef);
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
              ? "Agreement Request"
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
