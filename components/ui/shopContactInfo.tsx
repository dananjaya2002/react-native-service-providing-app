import React, { useEffect, useState } from "react";
import { Pressable, Text, StyleSheet, View, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShopList } from "@/interfaces/iShop";
import { addShopToFavorites, isShopInFavorites } from "@/utility/u_handleUserFavorites";

// Define the shape of each contact option
export interface ContactOption {
  text: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

interface ShopContactInfoProps {
  shop?: ShopList; // ShopList object passed as a prop (nullable/optional)
  onOptionSelect?: (option: string) => void; // Optional callback for other options
}

const ShopContactInfo: React.FC<ShopContactInfoProps> = ({
  shop,
  onOptionSelect = (option) => console.log(option),
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true); // For activity indicator
  const [buttonDisabled, setButtonDisabled] = useState(false); // To disable the button after 10 seconds

  // Check if the shop is already in favorites when the component mounts
  useEffect(() => {
    if (!shop) {
      // If no shop is provided, start a timeout to disable the button after 10 seconds
      const timeout = setTimeout(() => {
        setButtonDisabled(true);
        setLoading(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }

    const checkIfBookmarked = async () => {
      setLoading(true);
      const bookmarked = await isShopInFavorites(shop);
      setIsBookmarked(bookmarked);
      setLoading(false);
    };

    checkIfBookmarked();
  }, [shop]);

  const handlePress = async (option: ContactOption) => {
    if (option.text === "Save") {
      if (!shop) {
        Alert.alert("Error", "Shop data is not available.");
        return;
      }

      if (isBookmarked) {
        Alert.alert("Info", "This shop is already in your favorites.");
        return;
      }

      console.log("Adding shop to favorites:", shop);
      const success = await addShopToFavorites(shop);
      if (success) {
        setIsBookmarked(true);
        Alert.alert("Success", "Shop added to your favorites.");
      } else {
        Alert.alert("Error", "Failed to modify Save Icon. Please try again.");
      }
    } else {
      onOptionSelect(option.text); // Handle other options via the callback
    }
  };

  const contactOptions: ContactOption[] = [
    { text: "Call", iconName: "call" },
    { text: "Chat", iconName: "chatbubbles" },
    {
      text: "Save",
      iconName: isBookmarked ? "bookmark" : "bookmark-outline", // Dynamic icon
    },
    { text: "Share", iconName: "share" },
  ];

  return (
    <View style={styles.container}>
      {contactOptions.map((option, index) => (
        <Pressable
          key={index}
          style={[
            styles.button,
            option.text === "Save" && buttonDisabled ? styles.disabledButton : null, // Disable button visually
          ]}
          onPress={() => handlePress(option)}
          disabled={option.text === "Save" && (loading || buttonDisabled)} // Disable button functionally
        >
          {option.text === "Save" && loading ? ( // Show activity indicator for "Save" button
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <>
              <Ionicons name={option.iconName} size={28} color={buttonDisabled ? "#ccc" : "#333"} />
              <Text
                style={[
                  styles.buttonText,
                  buttonDisabled ? { color: "#ccc" } : null, // Change text color if disabled
                ]}
              >
                {option.text}
              </Text>
            </>
          )}
        </Pressable>
      ))}
    </View>
  );
};

export default ShopContactInfo;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin: 2,
    paddingVertical: 8,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android elevation
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0", // Visually indicate the button is disabled
  },
  buttonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },
});
