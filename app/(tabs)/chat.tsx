import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

// Define types for TypeScript
type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
};

export default function ChatList() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // Initialize the router once outside of renderItem

  // Simulate fetching chat data
  useEffect(() => {
    const fetchChats = async () => {
      // Simulate API call delay
      setTimeout(() => {
        setChats([
          {
            id: "1",
            name: "John Doe",
            lastMessage: "Hey! How are you?",
            timestamp: "10:30 AM",
            unreadCount: 2,
          },
          {
            id: "2",
            name: "Jane Smith",
            lastMessage: "See you tomorrow!",
            timestamp: "Yesterday",
          },
          {
            id: "3",
            name: "Alice Johnson",
            lastMessage: "Sent a photo",
            timestamp: "2 days ago",
          },
          {
            id: "4",
            name: "Michael Brown",
            lastMessage: "Let’s catch up later!",
            timestamp: "11:45 AM",
          },
          {
            id: "5",
            name: "Emily Davis",
            lastMessage: "Got your message",
            timestamp: "4:30 PM",
            unreadCount: 1,
          },
          {
            id: "6",
            name: "David Wilson",
            lastMessage: "Thanks for the update!",
            timestamp: "Monday",
          },
          {
            id: "7",
            name: "Sarah Miller",
            lastMessage: "Looking forward to it!",
            timestamp: "3 days ago",
          },
          {
            id: "8",
            name: "Chris Lee",
            lastMessage: "I’ll be there soon.",
            timestamp: "5:15 PM",
            unreadCount: 3,
          },
          {
            id: "9",
            name: "Sophia Anderson",
            lastMessage: "Meeting postponed",
            timestamp: "6:50 AM",
          },
          {
            id: "10",
            name: "Daniel Martin",
            lastMessage: "On my way!",
            timestamp: "2:00 PM",
          },
          {
            id: "11",
            name: "Grace Thompson",
            lastMessage: "Call me later",
            timestamp: "Yesterday",
          },
          {
            id: "12",
            name: "James White",
            lastMessage: "Sent a document",
            timestamp: "Last week",
          },
          {
            id: "13",
            name: "Mia Harris",
            lastMessage: "Great job!",
            timestamp: "1:30 PM",
            unreadCount: 1,
          },
          {
            id: "14",
            name: "Lucas Clark",
            lastMessage: "Let me know when free",
            timestamp: "9:00 AM",
          },
          {
            id: "15",
            name: "Charlotte Lewis",
            lastMessage: "Thanks for the invite!",
            timestamp: "10:00 AM",
          },
          {
            id: "16",
            name: "Oliver Walker",
            lastMessage: "Busy right now",
            timestamp: "8:20 AM",
            unreadCount: 2,
          },
          {
            id: "17",
            name: "Amelia Hall",
            lastMessage: "Let’s reschedule",
            timestamp: "Saturday",
          },
          {
            id: "18",
            name: "Henry Young",
            lastMessage: "Sent a voice note",
            timestamp: "5 days ago",
          },
          {
            id: "19",
            name: "Isabella King",
            lastMessage: "Looking forward to our trip!",
            timestamp: "Thursday",
          },
          {
            id: "20",
            name: "Ethan Scott",
            lastMessage: "Talk to you soon",
            timestamp: "Wednesday",
          },
          {
            id: "21",
            name: "Harper Green",
            lastMessage: "Just finished the project",
            timestamp: "12:00 PM",
          },
          {
            id: "22",
            name: "Jackson Baker",
            lastMessage: "I’ll get back to you",
            timestamp: "Yesterday",
          },
          {
            id: "23",
            name: "Ava Roberts",
            lastMessage: "Check your email",
            timestamp: "2:45 PM",
          },
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchChats();
  }, []);

  const navigateToChat = (chatId: string) => {
    router.push(`/chat/chatUi?itemId=${chatId}`);
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigateToChat(item.id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0]}</Text>
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.chatTimestamp}>{item.timestamp}</Text>
        {item.unreadCount && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
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
            data={chats}
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
