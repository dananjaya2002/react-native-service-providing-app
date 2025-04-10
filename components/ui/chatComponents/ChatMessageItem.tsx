import React, { memo, useEffect, useRef } from "react";
import { Animated, Text, View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import { ChatMessage } from "../../../hooks/useChat";
import ChatAgreementAcceptsCard from "./ChatAgreementAcceptBtn";

import { ChatMessage, UserRoles } from "../../../interfaces/iChat";

interface ChatMessageItemProps {
  item: ChatMessage;
  userID: string;
  chatRoomDocRefId: string;
  userRole: UserRoles;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  item,
  userID,
  chatRoomDocRefId,
  userRole,
}) => {
  // Use animation for dynamic background color
  const animation = useRef(new Animated.Value(item.status === "pending" ? 0 : 1)).current;
  // For non-agreement messages, use sender color logic.
  const finalBackgroundColor = item.senderId === userID ? "#0d6efd" : "#e9ecef";
  const pendingColor = "#3991eb";

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [pendingColor, finalBackgroundColor],
  });

  useEffect(() => {
    if (item.status !== "pending") {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [item.status]);

  // Render content based on messageType
  const renderMessageContent = () => {
    switch (item.messageType) {
      case "imageURL":
        return <Image source={{ uri: item.value }} style={styles.messageImage} />;
      case "AgreementRequest":
        return (
          <View style={styles.agreementInnerContainer}>
            <ChatAgreementAcceptsCard chatRoomDocRefId={chatRoomDocRefId} userRole={userRole} />
          </View>
        );
      case "textMessage":
      default:
        return (
          <Text
            style={[
              styles.messageText,
              item.senderId === userID ? styles.sentMessageText : styles.receivedMessageText,
            ]}
          >
            {item.value}
          </Text>
        );
    }
  };

  // For AgreementRequest, override container styles (full width, no padding, no timestamp)
  const containerStyle =
    item.messageType === "AgreementRequest"
      ? [
          styles.agreementMessageContainer,
          { backgroundColor },
          userRole === "serviceProvider"
            ? { marginLeft: 40, marginRight: 1 }
            : { marginLeft: 1, marginRight: 40 },
        ]
      : [
          styles.messageContainer,
          { backgroundColor },
          item.senderId === userID ? styles.sentMessage : styles.receivedMessage,
        ];

  return (
    <Animated.View style={containerStyle}>
      {renderMessageContent()}
      {item.messageType !== "AgreementRequest" && (
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
      )}
    </Animated.View>
  );
};

export default memo(ChatMessageItem);

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
  // For agreement messages, take full width and remove padding.
  agreementMessageContainer: {
    flex: 1,
    marginVertical: 10,
    marginRight: 1,
    marginLeft: 40,
    padding: 0,
    borderRadius: 25,
    // Optionally, add a subtle border if desired:
    borderWidth: 1,
    borderColor: "#ccc",
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
  // Optionally style the inner container for AgreementRequest content
  agreementInnerContainer: {
    // Use full available width from parent container
    width: "100%",
    padding: 8,
  },
});
