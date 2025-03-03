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
  Image,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
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
        const chatCollectionRef = collection(db, "Chat");
        const chatQuery = query(chatCollectionRef, where(userRoleDocFieldPath, "==", userRef));
        const chatSnapshot = await getDocs(chatQuery);

        const chatRoomsWithLatestMessages = await Promise.all(
          chatSnapshot.docs.map(async (doc) => {
            const chatData = doc.data();
            // Default to no additional message data
            let lastMessageData = {};
            try {
              // Define the sub collection reference
              const messagesRef = collection(doc.ref, "Messages");

              // Query for the latest message, sorting by "timestamp" descending
              const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
              const messagesSnapshot = await getDocs(messagesQuery);

              if (!messagesSnapshot.empty) {
                const latestMessageDoc = messagesSnapshot.docs[0];
                const latestData = latestMessageDoc.data();

                // Here we assume the message text is stored in a field named "message"
                lastMessageData = {
                  lastMessage: latestData?.textChat || "Image",
                  timestamp: latestData.timestamp
                    ? new Date(latestData.timestamp.seconds * 1000).toLocaleString() // Convert to readable date
                    : "No timestamp",
                };
              }
            } catch (subError) {
              console.error(
                `Error fetching messages subcollection for chat room ${doc.id}:`,
                subError
              );
            }
            return {
              id: doc.id,
              ...chatData,
              ...lastMessageData,
            } as ChatRoom;
          })
        );
        console.log("Fetched chat rooms:", chatRoomsWithLatestMessages);
        setChatRooms(chatRoomsWithLatestMessages);
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
    //router.push(`/chat/chatUi?chatRoomDocRefId=${chatRoom}`);

    router.push({
      pathname: "/chat/chatUi",
      params: {
        userID: userRef,
        chatRoomDocRefId: chatRoom,
      },
    });
    //console.log("Navigating to chat room:", chatRoom);
  };

  // Render each chat item
  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    console.log("\n\nitem data: ", item);
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
    console.log("profile image: ", otherUserProfilePicURL);

    // Converting Time
    if (!item.timestamp) {
      timestampText = "Just now";
    } else if (typeof item.timestamp === "string") {
      timestampText = item.timestamp;
    } else {
      timestampText = item.timestamp.toDate().toLocaleString(); // Convert Firestore Timestamp to readable format
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
