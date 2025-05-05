import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { UserStorageService } from "@/storage/functions/userStorageService";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

interface HeaderProps {
  title: string;
  onPressBack?: () => void;
  showProfileIcon?: boolean;
  showLogoutButton?: boolean;
}

const HeaderMain: React.FC<HeaderProps> = ({
  title,
  onPressBack,
  showProfileIcon = true,
  showLogoutButton = false,
}) => {
  const { colors } = useTheme();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    UserStorageService.getUserData().then((userData) => {
      if (userData?.profileImageUrl) {
        setProfileImageUrl(userData.profileImageUrl);
      }
    });
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await UserStorageService.clearUserData();
            router.push("/login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
      {/* Left: back button or placeholder */}
      {onPressBack ? (
        <TouchableOpacity onPress={onPressBack} style={styles.sideButton}>
          <Ionicons name="arrow-back" size={32} color="black" />
        </TouchableOpacity>
      ) : (
        <View style={styles.sidePlaceholder} />
      )}

      {/* Center: absolutely positioned title */}
      <View style={styles.absoluteCenter}>
        <Text style={[styles.titleText, { color: colors.text }]}>{title}</Text>
      </View>

      {/* Right: logout + profile */}
      <View style={styles.rightContainer}>
        {showLogoutButton && (
          <TouchableOpacity onPress={handleLogout} style={styles.sideButton}>
            <Ionicons name="log-out-outline" size={28} color="black" />
          </TouchableOpacity>
        )}
        {showProfileIcon &&
          (profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
          ) : (
            <FontAwesome name="user-circle" size={28} color="black" />
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative", // so absoluteCenter is relative to this
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.2)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    marginBottom: 8,
  },
  sideButton: {
    padding: 8,
  },
  sidePlaceholder: {
    width: 32 + 16, // match the arrow-back size + padding (32 icon + 2*8)
  },
  absoluteCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  rightContainer: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
  },
});

export default HeaderMain;
