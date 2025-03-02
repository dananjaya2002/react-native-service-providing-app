// roleSelection.tsx
import React from "react";
import { View, Button, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";

import { db } from "../../../FirebaseConfig";

/**
 * AssumptionS: Customer should click the chat button from the shop page and create a chat room.
 *
 * In this simulator, the customer will always be the one to initiate the chat and lead to creating a chat room.
 * The service provider will be attached to the chat room.
 *
 * Required: two users doc reference, one as a service provider and the other as a customer.
 * Required: reference to the chat room.
 *
 */

export default function RoleSelection() {
  const router = useRouter();

  let customerDocRef = "HuzthgFKQGOPO1D884V9"; // Simulate customer doc reference
  let serviceProviderDocRef = "M4NdXpFLu4hjwWde2r1r"; // Simulate provider doc reference
  let chatRoomDocRef = ""; // Simulate chat room reference

  let selfID = ""; // Simulate self ID

  const selectRole = (role: "provider" | "customer") => {
    // Navigate to chat screen and pass the role as a query parameter
    // if (!chatRoomDocRef) {
    //   Alert.alert("Error", `Char Room Ref is empty: ${chatRoomDocRef}`);
    //   return;
    // }
    if (role === "provider") {
      selfID = serviceProviderDocRef;
    } else {
      selfID = customerDocRef;
    }

    router.push({
      pathname: "/(tabs)/chat",
      params: {
        role: role,
        userID: selfID,
        chatRoomDocRef: chatRoomDocRef,
      },
    });
  };

  const createChatRoom = async () => {
    if (!db) {
      console.warn("❌ Failed to get access access Firebase - roleSelection.tsx");
      Alert.alert("Error", "Failed to get access access Firebase");
      return null;
    }

    try {
      const chatCollectionRef = collection(db, "Chat");
      const docRef = await addDoc(chatCollectionRef, {
        serviceProviderRef: serviceProviderDocRef,
        customerRef: customerDocRef,
      });

      chatRoomDocRef = docRef.id;
    } catch (error) {
      console.error("❌ Failed to create chat room:", error);
    }
    Alert.alert("Success", `Chat Room Created! Ref: ${chatRoomDocRef}`);
  };

  return (
    <View className="flex-1 bg-green-700 justify-center gap-5 py-28">
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-purple-300 m-5"
        onPress={() => selectRole("provider")}
      >
        <Text className="text-xl font-bold">Service Provider</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-purple-300 m-5"
        onPress={() => selectRole("customer")}
      >
        <Text className="text-xl font-bold">Customer</Text>
      </TouchableOpacity>
      <View className="h-[200]" />
      <TouchableOpacity
        className="h-16 justify-center items-center bg-red-600 m-5"
        onPress={() => createChatRoom()}
      >
        <Text className="text-xl font-bold">Create a Chat Room</Text>
      </TouchableOpacity>
    </View>
  );
}
