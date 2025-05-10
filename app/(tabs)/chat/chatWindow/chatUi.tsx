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
  Alert,
  BackHandler,
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
import { ShopList, ShopPageData } from "@/interfaces/iShop";
import { getShopPageData } from "@/utility/U_getUserShopPageData";
import { getShopListData } from "@/utility/u_getShopListData";

// export type MessageTypes = "textMessage" | "imageURL" | "AgreementRequest";
// type UserRoles = "customer" | "serviceProvider";

/**
 * ChatScreen Component
 *
 * This component represents the chat screen of the application. It provides functionality for
 * sending and receiving messages, uploading images, requesting agreements, and rating services.
 * It also handles user interactions and displays chat messages in a list.
 *
 * @component
 *
 * @localparam {string} chatRoomDocRefId - The document reference ID of the chat room.
 * @localparam {string} userID - The ID of the current user.
 * @localparam {UserRoles} userRole - The role of the current user, either "customer" or "serviceProvider".
 * @localparam {string} otherPartyUserId - The ID of the other party in the chat.
 *
 * @returns {JSX.Element} The rendered chat screen component.
 */
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
  const {
    chatArray,
    loadMoreMessages,
    sendMessage,
    loadingMore,
    agreementStatus,
    participantOnlineStatus,
  } = useChat(chatRoomDocRefId, userID, userRole);

  // User Online Status ------------------------------------------------------------------------------------
  useEffect(() => {
    console.log("Participant Online Status:", participantOnlineStatus);
  }, [participantOnlineStatus]);

  // Get the other party's data from firebase
  useEffect(() => {
    console.log("Fetching other party data...");
    console.log("Other Party User ID:", otherPartyUserId);
    if (!otherPartyUserId) return;

    const fetchOtherPartyData = async () => {
      try {
        if (userRole === "customer") {
          const data = await getShopListData(otherPartyUserId);
          console.log("getUserData:", data);
          setOtherPartyData(data);
        } else if (userRole === "serviceProvider") {
          const data = await getUserData(otherPartyUserId);
          console.log("getShopListData:", data);
          setOtherPartyData(data);
        }
      } catch (error) {
        console.error("Error fetching other party data:", error);
        Alert.alert("Error", "Failed to fetch other party data.");
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

  useEffect(() => {
    handleRatingPermission();
    console.log("handleRatingPermission Triggered:", agreementStatus);
  }, [chatRoomDocRefId, agreementStatus]);

  const handleRatingPermission = useCallback(async () => {
    if (chatRoomDocRefId && userRole === "customer") {
      setCommentDisplayPermission(agreementStatus.shouldDisplayCommentUI);
      setCommentWaitingTime(agreementStatus.waitingTime);

      // if (!shouldDisplayCommentUI) {
      //   // Handle case when comment is not available.
      //   console.log(`Please wait ${Math.ceil(waitingTime / 60000)} minute(s) before commenting.`);
      // } else {
      //   console.log("Commenting is available.");
      //   // Proceed with rating functionality.
      // }
      console.log("Comment Display Permission:", agreementStatus.shouldDisplayCommentUI);
      console.log("Comment Waiting Time:", agreementStatus.waitingTime);
    }
  }, [agreementStatus]);

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

  const handleBackPress = () => {
    // Reset the chat tab stack when leaving the chat UI
    router.replace("/(tabs)/chat/chatRooms/shopChat");
    router.setParams({ reset: "true" });
    return true; // Indicate that the back press has been handled
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => backHandler.remove();
  }, []);

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
        profileImageUrl={
          otherPartyData?.profileImageUrl ||
          "https://res.cloudinary.com/dpjdmbozt/image/upload/v1746345933/placeholderUserImage_wqgtky.jpg"
        }
        profileName={otherPartyData?.userName || "....."}
        isParticipantOnline={participantOnlineStatus}
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
              backgroundColor: "#48ACF0",
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
                pathname: "/(tabs)/chat/chatWindow/shopRatingPage",
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
