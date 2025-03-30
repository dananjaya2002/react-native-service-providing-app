import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface ChatHeaderProps {
  profileImageUrl: string;
  profileName: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ profileImageUrl, profileName }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Title (centered) */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{profileName}</Text>
      </View>

      {/* Profile Image on the right */}
      {profileImageUrl ? (
        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
      ) : (
        <View style={styles.profilePlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "#fad6be", // primary color
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 50,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: "auto",
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: "auto",
    backgroundColor: "#ccc",
  },
});

export default ChatHeader;
