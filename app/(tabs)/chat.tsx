import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

// Define types
type ChatRoom = {
  id: string;
  customerRef: string;
  serviceProviderRef: string;
  name?: string;
  lastMessage?: string;
  timestamp?: string;
};
/**
 * Currently we trying to simulate both roles in the same page section. So we have to use dynamic userRoleType
 * Goal is to find the all document where the user role field is match with the userRef
 */

export default function ChatList() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { role, customerDocRef, serviceProviderDocRef } = useLocalSearchParams();

  // Identify user type
  const userRef = role === "provider" ? serviceProviderDocRef : customerDocRef;
  const userRoleType = role === "provider" ? "serviceProviderRef" : "customerRef";

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

  // Fetch chat data
  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!db) {
          console.warn("❌ Firebase not initialized.");
          Alert.alert("Error", "Failed to access Firebase");
          return;
        }

        if (!userRef) {
          console.warn("❌ User reference is undefined.");
          return;
        }

        setIsLoading(true);
        const usersRef = collection(db, "Chat");
        const q = query(usersRef, where(userRoleType, "==", userRef));

        const querySnapshot = await getDocs(q);
        const chatRooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatRoom[];

        console.log("Fetched chat rooms:", chatRooms);
        setChatRooms(chatRooms);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [role, userRef]);

  // Navigate to chat screen
  const navigateToChat = (chatRoom: string) => {
    router.push(`/chat/chatUi?chatRoomDocRefId=${chatRoom}`);
    //console.log("Navigating to chat room:", chatRoom);
  };

  // Render each chat item
  const renderChatItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item.id)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name ? item.name.charAt(0) : "?"}</Text>
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.name || "Unknown User"}</Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.lastMessage || "No messages yet"}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.chatTimestamp}>{item.timestamp || "Just now"}</Text>
      </View>
    </TouchableOpacity>
  );

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
    backgroundColor: "#fff",
    marginTop: 30,
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
    backgroundColor: "#f9f9f9",
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
  },
  chatMessage: {
    fontSize: 14,
    color: "#666",
  },
  chatMeta: {
    alignItems: "flex-end",
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
