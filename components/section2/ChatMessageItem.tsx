// components/ChatMessageItem.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Text, View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChatMessage } from "../../hooks/useChat";

interface ChatMessageItemProps {
  item: ChatMessage;
  userID: string;
}
/**
 *
 * @param ChatMessage - The message object to display.
 * @param userID - The ID of the current user.
 * @returns
 */
const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ item, userID }) => {
  // Create an Animated.Value that starts at 0 if pending, 1 if not.
  const animation = useRef(new Animated.Value(item.status === "pending" ? 0 : 1)).current;

  // Determine final background color based on sender.
  const finalBackgroundColor = item.senderId === userID ? "#0d6efd" : "#e9ecef";
  const pendingColor = "#FFFACD"; // yellow

  // Interpolate background color.
  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [pendingColor, finalBackgroundColor],
  });

  useEffect(() => {
    if (item.status !== "pending") {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false, // backgroundColor interpolation doesn't support native driver
      }).start();
    }
  }, [item.status]);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        { backgroundColor },
        item.senderId === userID ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
      ) : (
        <Text
          style={[
            styles.messageText,
            item.senderId === userID ? styles.sentMessageText : styles.receivedMessageText,
          ]}
        >
          {item.textChat}
        </Text>
      )}
      <View style={styles.timestampContainer}>
        {item.timestamp === null && item.status === "pending" ? (
          <Ionicons name="time-outline" size={12} color="#888" />
        ) : (
          <Text style={styles.messageTimestamp}>
            {item.timestamp
              ? item.timestamp.toDate
                ? item.timestamp.toDate().toLocaleTimeString()
                : new Date(item.timestamp).toLocaleTimeString()
              : ""}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sentMessage: {
    alignSelf: "flex-end",
  },
  receivedMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentMessageText: {
    color: "#fff",
  },
  receivedMessageText: {
    color: "#333",
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#888",
    marginLeft: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 5,
  },
});

export default ChatMessageItem;
