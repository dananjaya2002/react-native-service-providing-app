import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  FlatList,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Text,
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

import { UserRoles } from "../../../../interfaces/iChat";
import Animated, {
  Easing,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { UserData } from "@/interfaces/UserData";
import { getShopListData } from "@/utility/u_getShopListData";

/**
 * ChatScreen Component
 *
 * This component handles messaging between customers and service providers,
 * with features for text messages, images, agreements, and ratings.
 */
export default function ChatScreen() {
  // Route params
  const { chatRoomDocRefId, userID, userRole, otherPartyUserId } = useLocalSearchParams<{
    chatRoomDocRefId: string;
    userID: string;
    userRole: UserRoles;
    otherPartyUserId: string;
  }>();

  // References
  const chatListRef = useRef<FlatList>(null);

  // State
  const [commentDisplayPermission, setCommentDisplayPermission] = useState<boolean>(false);
  const [commentWaitingTime, setCommentWaitingTime] = useState<number>(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [otherPartyData, setOtherPartyData] = useState<UserData | null>(null);

  // Chat hook
  const {
    chatArray,
    loadMoreMessages,
    sendMessage,
    loadingMore,
    agreementStatus,
    participantOnlineStatus,
  } = useChat(chatRoomDocRefId, userID, userRole);

  // Fetch other party's data
  useEffect(() => {
    if (!otherPartyUserId) return;

    const fetchOtherPartyData = async () => {
      try {
        if (userRole === "customer") {
          const data = await getShopListData(otherPartyUserId);
          setOtherPartyData(data);
        } else if (userRole === "serviceProvider") {
          const data = await getUserData(otherPartyUserId);
          setOtherPartyData(data);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch other party data.");
      }
    };

    fetchOtherPartyData();
  }, [otherPartyUserId, userRole]);

  // Text Message Handling
  const handleSendTextMessage = useCallback(async () => {
    if (!currentMessage.trim()) return;
    const textMessage = currentMessage.trim();
    setCurrentMessage("");
    await sendMessage({ messageType: "textMessage", value: textMessage });
  }, [currentMessage, sendMessage]);

  // Image Message Handling
  const handleSendImageMessage = useCallback(
    async (imageUri: string) => {
      try {
        const imageUrl = await uploadImageToCloud(imageUri);
        if (!imageUrl) {
          Alert.alert("Error", "Image upload failed");
          return;
        }
        await sendMessage({ messageType: "imageURL", value: imageUrl });
      } catch (error) {
        Alert.alert("Error", "Failed to send image");
      }
    },
    [sendMessage]
  );

  const handleImageSelection = useCallback(async () => {
    Keyboard.dismiss();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera roll permissions required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;
    await handleSendImageMessage(imageUri);
  }, [handleSendImageMessage]);

  // Agreement Handling
  const handleAgreementRequest = useCallback(() => {
    if (chatRoomDocRefId && userRole === "serviceProvider") {
      sendMessage({ messageType: "AgreementRequest", value: "<Agreement Requested>" });
    }
  }, [chatRoomDocRefId, userRole, sendMessage]);

  // Rating Permission Handling
  useEffect(() => {
    handleRatingPermission();
  }, [chatRoomDocRefId, agreementStatus]);

  const handleRatingPermission = useCallback(() => {
    if (chatRoomDocRefId && userRole === "customer") {
      setCommentDisplayPermission(agreementStatus.shouldDisplayCommentUI);
      setCommentWaitingTime(agreementStatus.waitingTime);
    }
  }, [agreementStatus, chatRoomDocRefId, userRole]);

  // Rating UI Animation
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = userRole === "customer" && commentDisplayPermission ? 1 : 0;
  }, [commentDisplayPermission, userRole]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animatedValue.value * 0 }],
  }));

  // Navigation Handling
  const handleBackPress = useCallback(() => {
    router.replace("/(tabs)/chat/chatRooms/shopChat");
    router.setParams({ reset: "true" });
    return true;
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => backHandler.remove();
  }, [handleBackPress]);

  // Render Message Items
  const renderChatMessage = useCallback(
    ({ item }: { item: any }) => (
      <ChatMessageItem
        item={item}
        userID={userID}
        chatRoomDocRefId={chatRoomDocRefId}
        userRole={userRole}
      />
    ),
    [userID, chatRoomDocRefId, userRole]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2F3F4" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 30}
    >
      {/* Chat Header */}
      <ChatHeader
        profileImageUrl={
          otherPartyData?.profileImageUrl ||
          "https://res.cloudinary.com/dpjdmbozt/image/upload/v1746345933/placeholderUserImage_wqgtky.jpg"
        }
        profileName={otherPartyData?.userName || "....."}
        isParticipantOnline={participantOnlineStatus}
      />

      {/* Agreement Button for Service Providers */}
      {userRole === "serviceProvider" && (
        <AgreementFAButton chatRoomDocRefId={chatRoomDocRefId} onPress={handleAgreementRequest} />
      )}

      {/* Message List */}
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

      {/* Rating Button for Customers */}
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

      {/* Message Input Area */}
      <View style={styles.messageInputContainer}>
        <TouchableOpacity onPress={handleImageSelection} style={styles.imageButton}>
          <Ionicons name="image-outline" size={24} color="#333" />
        </TouchableOpacity>

        <TextInput
          style={styles.messageInputField}
          value={currentMessage}
          placeholder="Type your message"
          onChangeText={setCurrentMessage}
          onSubmitEditing={handleSendTextMessage}
        />

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
