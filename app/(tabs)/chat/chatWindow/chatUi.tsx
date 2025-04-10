import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  FlatList,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
  Text,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { uploadImageToCloud } from "../../../../utility/u_uploadImageNew";
import { getUserData } from "../../../../utility/u_getUserData";

import { useChat } from "../../../../hooks/useChat";
import ChatMessageItem from "@/components/ui/chatComponents/ChatMessageItem";
import AgreementFAButton from "@/components/ui/chatComponents/AgreementFAButton";
import ChatHeader from "@/components/ui/chatComponents/ChatHeader";

// interfaces
import { UserRoles } from "../../../../interfaces/iChat";
import Animated, {
  Easing,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { UserData } from "@/interfaces/UserData";
import { ShopPageData } from "@/interfaces/iShop";

// export type MessageTypes = "textMessage" | "imageURL" | "AgreementRequest";
// type UserRoles = "customer" | "serviceProvider";

export default function ChatScreen() {
  // Retrieve the dynamic parameters from the URL
  const { chatRoomDocRefId, userID, userRole, otherPartyUserId } = useLocalSearchParams<{
    chatRoomDocRefId: string;
    userID: string;
    userRole: UserRoles;
    otherPartyUserId: string;
  }>();
  // Reference to the FlatList for scrolling
  const chatListRef = useRef<FlatList>(null);

  // Comment display permission and waiting time state
  const [commentDisplayPermission, setCommentDisplayPermission] = useState<boolean>(false);
  const [commentWaitingTime, setCommentWaitingTime] = useState<number>(0);

  // Other state variables
  const [currentMessage, setCurrentMessage] = useState("");
  const [otherPartyData, setOtherPartyData] = useState<UserData | null>(null);
  // custom hook to manage chat messages
  const { chatArray, loadMoreMessages, sendMessage, loadingMore, checkCommentAvailability } =
    useChat(chatRoomDocRefId, userID);

  // Get the other party's data from firebase
  useEffect(() => {
    if (!otherPartyUserId) return;
    const fetchOtherPartyData = async () => {
      try {
        const data = await getUserData(otherPartyUserId);
        setOtherPartyData(data);
      } catch (error) {
        console.error("Error fetching other party data:", error);
      }
    };

    fetchOtherPartyData();
  }, [otherPartyUserId]);

  // Handle Send Text Message
  const handleSendTextMessage = useCallback(async () => {
    if (!currentMessage.trim()) return;
    const textMessage = currentMessage.trim();
    setCurrentMessage("");
    await sendMessage({ messageType: "textMessage", value: textMessage });
  }, [currentMessage, sendMessage]);

  // -----------------------------------------------------------------------------------
  // Image Selection and Upload Section

  const handleSendImageMessage = useCallback(
    async (imageUri: string) => {
      try {
        const imageUrl = await uploadImageToCloud(imageUri);
        if (!imageUrl) {
          console.error("Image upload failed");
          return;
        }
        await sendMessage({ messageType: "imageURL", value: imageUrl });
      } catch (error) {
        console.error("Error sending image message:", error);
      }
    },
    [sendMessage]
  );

  const handleImageSelection = useCallback(async () => {
    Keyboard.dismiss();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Camera roll permissions required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (result.canceled) {
      return;
    }
    const imageUri = result.assets[0].uri;
    await handleSendImageMessage(imageUri);
  }, [handleSendImageMessage]);

  // -----------------------------------------------------------------------------------
  // Agreement Section

  const handleAgreementRequest = useCallback(() => {
    if (chatRoomDocRefId && userRole === "serviceProvider") {
      sendMessage({ messageType: "AgreementRequest", value: "<Agreement Requested>" });
    }
  }, [chatRoomDocRefId, userRole]);

  const handleRatingPermission = useCallback(async () => {
    if (chatRoomDocRefId && userRole === "customer") {
      const { shouldDisplayCommentUI, waitingTime } = await checkCommentAvailability();
      setCommentDisplayPermission(shouldDisplayCommentUI);
      setCommentWaitingTime(waitingTime);

      // if (!shouldDisplayCommentUI) {
      //   // Handle case when comment is not available.
      //   console.log(`Please wait ${Math.ceil(waitingTime / 60000)} minute(s) before commenting.`);
      // } else {
      //   console.log("Commenting is available.");
      //   // Proceed with rating functionality.
      // }
    }
  }, [checkCommentAvailability]);

  // Check for the rating permission at the start
  useEffect(() => {
    handleRatingPermission();
  }, [chatRoomDocRefId, userRole]);

  // Rating option display UI animation
  const animatedValue = useSharedValue(0);
  useEffect(() => {
    if (userRole === "customer" && commentDisplayPermission) {
      animatedValue.value = 1;
    } else {
      animatedValue.value = 0;
    }
  }, [commentDisplayPermission]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: animatedValue.value * 0 }], //initial translateY is 0.
    };
  });

  // -------------------------------------------------------------------------------
  // Render Chat Messages
  const renderChatMessage = useCallback(
    ({ item }: { item: any }) => (
      <ChatMessageItem
        item={item}
        userID={userID}
        chatRoomDocRefId={chatRoomDocRefId}
        userRole={userRole}
      />
    ),
    [userID]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2F3F4" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 30}
    >
      {/* Chat Header with Profile Image and Name */}
      <ChatHeader
        profileImageUrl={otherPartyData?.profileImageUrl || "undefined"}
        profileName={otherPartyData?.userName || "undefined"}
      />
      {/* AgreementFAButton - Service Provider */}
      {userRole === "serviceProvider" && (
        <AgreementFAButton chatRoomDocRefId={chatRoomDocRefId} onPress={handleAgreementRequest} />
      )}

      {/* Message List Display */}
      <FlatList
        ref={chatListRef}
        data={chatArray}
        keyExtractor={(item) => item.id}
        renderItem={renderChatMessage}
        inverted
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.1}
        style={{ flex: 1 }}
      />
      {/* Rating Button Section */}
      {userRole === "customer" && commentDisplayPermission && (
        <Animated.View
          style={[
            {
              backgroundColor: "#fad6be",
              height: 60,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
              borderTopWidth: 1,
              borderColor: "#878585",
            },
            animatedStyle,
          ]}
          entering={SlideInDown.duration(600).easing(Easing.ease)}
        >
          <TouchableOpacity
            style={{
              backgroundColor: commentWaitingTime > 0 ? "#3e8bd0" : "#ffffff",
              borderRadius: 12,
              borderWidth: commentWaitingTime > 0 ? 0 : 1,
              borderColor: "#e0e0e0",
              flexDirection: "row",
              paddingVertical: 10,
              paddingHorizontal: 14,
              opacity: commentWaitingTime > 0 ? 0.7 : 1,
              elevation: commentWaitingTime > 0 ? 0 : 2,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
            disabled={commentWaitingTime > 0}
            onPress={() => {
              router.push({
                pathname: "/(tabs)/chat/chatWindow/chatUi",
                params: {
                  serviceProviderId: otherPartyUserId,
                },
              });
            }}
          >
            <Ionicons
              name={commentWaitingTime > 0 ? "hourglass-outline" : "chatbox-ellipses-sharp"}
              size={24}
              color={commentWaitingTime > 0 ? "#fff" : "#333"}
            />
            <Text
              style={{
                fontSize: 16,
                marginLeft: 8,
                color: commentWaitingTime > 0 ? "#fff" : "#333",
                fontFamily: "System",
                fontWeight: commentWaitingTime > 0 ? "500" : "400",
              }}
            >
              {commentWaitingTime > 0
                ? `Please wait ${Math.ceil(commentWaitingTime / 60000)} minute(s)`
                : "Rate the Service"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Message Input Section */}
      <View style={styles.messageInputContainer}>
        {/* Image button on the left */}
        <TouchableOpacity onPress={handleImageSelection} style={styles.imageButton}>
          <Ionicons name="image-outline" size={24} color="#333" />
        </TouchableOpacity>
        {/* Message input field in the center */}
        <TextInput
          style={styles.messageInputField}
          value={currentMessage}
          placeholder="Type your message"
          onChangeText={setCurrentMessage}
          onSubmitEditing={handleSendTextMessage}
        />
        {/* Send button on the right */}
        <TouchableOpacity
          onPress={handleSendTextMessage}
          disabled={!currentMessage.trim()}
          style={[styles.sendButton, { opacity: currentMessage.trim() ? 1 : 0.5 }]}
        >
          <Ionicons name="send" size={30} color="#333" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageInputContainer: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  imageButton: {
    marginRight: 8,
    padding: 4,
  },
  messageInputField: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sendButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
});
