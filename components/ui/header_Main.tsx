import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { UserStorageService } from "@/storage/functions/userStorageService";
import { router } from "expo-router";

interface HeaderProps {
  title: string;
  onPressBack?: () => void;
  showProfileIcon?: boolean;
  showLogoutButton?: boolean;
}

/**
 * HeaderMain component is a reusable header component that displays a title,
 * an optional back button, a profile icon, and an optional logout button.
 *
 * @param {string} title - The title to display in the header.
 * @param {function} onPressBack - Optional function to call when the back button is pressed.
 * @param {boolean} showProfileIcon - Optional flag to show the profile icon (default: true).
 * @param {boolean} showLogoutButton - Optional flag to show the logout button (default: false).
 */
const HeaderMain: React.FC<HeaderProps> = ({
  title,
  onPressBack,
  showProfileIcon = true,
  showLogoutButton = false,
}) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      const userData = await UserStorageService.getUserData();
      if (userData?.profileImageUrl) {
        setProfileImageUrl(userData.profileImageUrl);
      }
    };
    fetchProfileImage();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await UserStorageService.clearUserData();
            console.log("User data cleared");
            router.push("/login");
          },
        },
      ],
      { cancelable: true }
    );
  };
  return (
    <View
      style={styles.headerContainer}
      className="flex-row items-center h-[56px] bg-primary px-4 border-b border-gray-200"
    >
      {onPressBack ? (
        <TouchableOpacity onPress={onPressBack} className="mr-2 p-2">
          <Ionicons name="arrow-back" size={32} color="black" />
        </TouchableOpacity>
      ) : (
        <View className="w-6" />
      )}
      <Text className="text-xl font-bold flex-1 text-center text-gray-800">{title}</Text>
      {showLogoutButton && ( // Conditionally render the logout button
        <TouchableOpacity onPress={handleLogout} className="ml-2">
          <Ionicons name="log-out-outline" size={28} color="black" />
        </TouchableOpacity>
      )}
      {showProfileIcon && // Conditionally render the profile icon
        (profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.profileImage} className="ml-2" />
        ) : (
          <FontAwesome name="user-circle" size={28} color="black" className="ml-2" />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});

export default HeaderMain;
