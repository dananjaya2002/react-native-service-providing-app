import React, { useEffect } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";

interface ChatHeaderProps {
  profileImageUrl: string;
  profileName: string;
  isParticipantOnline: boolean;
  onBackPress?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  profileImageUrl,
  profileName,
  isParticipantOnline,
  onBackPress,
}) => {
  const router = useRouter();
  const { colors, theme, setTheme } = useTheme();
  // Shared value drives both opacity/height for the online text and the profile name's margin.
  // Value will be 0 (offline) or 1 (online)
  const onlineValue = useSharedValue(isParticipantOnline ? 1 : 0);

  useEffect(() => {
    // Animate to 1 when online and to 0 when offline over 500ms.
    onlineValue.value = withTiming(isParticipantOnline ? 1 : 0, { duration: 500 });
  }, [isParticipantOnline]);

  // Animate the profile name's margin: when onlineValue=0 (offline) add extra top margin,
  // and when onlineValue=1, remove it.
  const animatedProfileNameStyle = useAnimatedStyle(() => ({
    // Adjust margin dynamically. You can tweak 18 to your desired offset.
    marginTop: (1 - onlineValue.value) * 4,
  }));

  // Animate the online text: adjust opacity and height.
  const animatedOnlineStyle = useAnimatedStyle(() => ({
    opacity: onlineValue.value,
    // Animate height to 18 when online, 0 when offline. Adjust 18 if needed.
    height: onlineValue.value * 18,
  }));

  // Handle back button press
  const handleBackPress = () => {
    if (onBackPress) {
      // Use the callback if provided
      onBackPress();
    } else {
      // Fall back to default behavior
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back Button */}
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Title Container */}
      <View style={styles.titleContainer}>
        <Animated.Text style={[styles.title, animatedProfileNameStyle]}>
          {profileName}
        </Animated.Text>
        <Animated.Text style={[styles.onlineText, animatedOnlineStyle]}>online</Animated.Text>
      </View>

      {/* Profile Image */}
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // ensures that when online text has 0 height, profileName is centered
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  onlineText: {
    fontSize: 12,
    color: "green",
    marginTop: 0,
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
