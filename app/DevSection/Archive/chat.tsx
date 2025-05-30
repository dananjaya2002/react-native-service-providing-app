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
import { db } from "../../../FirebaseConfig";
import { Timestamp, DocumentReference } from "firebase/firestore";
// Define types

type UserInfo = {
  docRef: DocumentReference; // Reference to the user document in Firestore
  name: string;
  profileImageUrl: string;
};

type ChatRoom = {
  id: string;
  customerRef: string;
  serviceProvider: UserInfo;
  customer: UserInfo;
  name?: string;
  lastMessage?: string;
  timestamp?: Timestamp;
};

/**
 * Currently we trying to simulate both roles in the same page section. So we have to use dynamic userRoleType
 * Goal is to find the all document where the user role field is match with the userRef
 */

/**
 * @userRole must be either "provider" or "customer"
 * There are some thing we should need to be aware for now.
 * This file required @userRole and @userDocRefId
 * We use them to filter documents based on field in chatroom documents.
 *
 * Keep in mind that the service provider can switch between two @userRole . so we need focus on that later.
 *
 */

export default function ChatList() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const chatRoomsRef = useRef<ChatRoom[]>([]); // dev only
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { userID, role } = useLocalSearchParams();

  // Identify user type
  const userRef = userID;
  const userRoleType = role === "provider" ? "serviceProviderRef" : "customerRef";
  const userRoleDocFieldPath = role === "provider" ? "serviceProvider.docRef" : "customer.docRef";

  // Handle back button navigation -- Development purpose only
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/DevSection/D_SimulateChat/roleSelection");
        return true; // Prevent default back action
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  /**
   *
   * Fetch Data from the firebase
   *
   */
  useEffect(() => {
    // Use cached chat rooms if available
    if (chatRoomsRef.current.length > 0) {
      console.log("✅ Using cached chat rooms");
      setChatRooms(chatRoomsRef.current);
      setIsLoading(false);
      return;
    }

    // Indicate loading has started
    setIsLoading(true);

    const chatCollectionRef = collection(db, "Chat");
    const chatQuery = query(chatCollectionRef, where(userRoleDocFieldPath, "==", userRef));

    // Attach the real-time listener
    const unsubscribe = onSnapshot(
      chatQuery,
      (chatSnapshot) => {
        // Map over documents to build chat rooms with latest message info
        const chatRooms = chatSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatRoom[];

        console.log("Fetched chat rooms:", chatRooms);
        setChatRooms(chatRooms);
        chatRoomsRef.current = chatRooms; // For caching during development

        // Data has been fetched—turn off loading indicator
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching chat rooms:", error);
        // On error, also stop loading
        setIsLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Navigate to chat screen
  const navigateToChat = (chatRoom: string) => {
    //router.push(`/chat/chatUi?chatRoomDocRefId=${chatRoom}`);

    router.push({
      pathname: "/(tabs)/chat/chatWindow/chatUi",
      params: {
        userID: userRef,
        chatRoomDocRefId: chatRoom,
      },
    });
    //console.log("Navigating to chat room:", chatRoom);
  };

  // Render each chat item
  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    let otherUserName;
    let otherUserProfilePicURL;
    let timestampText;

    // Finding out who is the other party
    if (role === "provider") {
      otherUserName = item.serviceProvider.name;
      otherUserProfilePicURL = item.serviceProvider.profileImageUrl;
    } else if (role === "customer") {
      otherUserName = item.customer.name;
      otherUserProfilePicURL = item.serviceProvider.profileImageUrl;
    } else {
      otherUserName = "Not Found";
      otherUserProfilePicURL = "Not Found";
    }

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
      <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item.id)}>
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
            {item.lastMessage || "No messages yet"}
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
          <Text style={styles.header}>Chats</Text>
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
