import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  BackHandler,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import HeaderMain from "@/components/ui/header_Main";
import { UserStorageService } from "../../../../storage/functions/userStorageService";
import { UserData } from "../../../../interfaces/UserData";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ShopList } from "@/interfaces/iShop";
import { getShopCardData, uploadUserRatings } from "@/utility/u_uploadUserRatings";
import { IUserRatingUploadParams } from "../../../../interfaces/iUserRatings";
import { useTheme } from "@/context/ThemeContext";

const ShopRatingPage = () => {
  const { colors } = useTheme();

  // State
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [shopCard, setShopCard] = useState<ShopList | null>(null);

  const { serviceProviderId } = useLocalSearchParams<{
    serviceProviderId: string;
  }>();

  // Handle star rating selection
  const handleStarPress = (star: number) => {
    setRating(star);
  };

  // Custom back handling
  const handleCustomBack = useCallback(() => {
    router.replace("/(tabs)/chat/chatWindow/chatUi");
    return true; // Prevents default back behavior
  }, []);

  // Handle hardware back button (Android)
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", handleCustomBack);
      return () => backHandler.remove();
    }, [handleCustomBack])
  );

  // Fetch shop and user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!serviceProviderId) {
          Alert.alert("Error", "Service Provider ID is missing");
          return;
        }

        const tempShopCardData = await getShopCardData(serviceProviderId);
        const tempUserData = await UserStorageService.getUserData();

        if (tempShopCardData === null) {
          Alert.alert("Error", "Could not retrieve shop information");
        } else if (tempUserData === null) {
          Alert.alert("Error", "Could not retrieve user information");
        } else {
          setShopCard(tempShopCardData);
          setUserData(tempUserData);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load shop information. Please try again.");
      }
    };

    fetchUserData();
  }, [serviceProviderId]);

  // Submit rating
  const submitComments = async () => {
    if (rating === 0) {
      Alert.alert("Missing Rating", "Please select a rating");
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert("Missing Comment", "Please enter your feedback");
      return;
    }

    if (!shopCard) {
      Alert.alert("Error", "Shop information not available");
      return;
    }

    setLoading(true);

    const submitCommentObject: IUserRatingUploadParams = {
      serviceProviderID: serviceProviderId,
      avgRatings: shopCard.avgRating,
      totalRatings: shopCard.totalRatingsCount || 0,
      comment: comment,
      newRating: rating,
    };

    const result = await uploadUserRatings(submitCommentObject);

    if (result) {
      Alert.alert("Success", "Rating submitted successfully");
      setRating(0);
      setComment("");
      setLoading(false);

      // Navigate back to the previous screen after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);
    } else {
      setLoading(false);
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#A4D6F8" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 35}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={{ flex: 1 }}>
          {/* Header Section */}
          <HeaderMain
            title="Rate the Service"
            onPressBack={() => router.back()}
            showProfileIcon={true}
            showLogoutButton={false}
          />

          <View style={styles.mainContainer}>
            {/* Shop Info Card */}
            <View style={styles.shopCardContainer}>
              <Image
                style={styles.shopImage}
                source={{
                  uri: shopCard?.shopPageImageUrl || "https://placehold.co/400x200?text=No+Image",
                }}
              />
              <View style={styles.shopInfoContainer}>
                <Text style={styles.shopName}>{shopCard?.shopName || "Loading..."}</Text>
                <Text style={styles.shopDescription}>
                  Ratings: {shopCard?.totalRatingsCount || "Loading..."}
                </Text>
              </View>
            </View>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Rate your experience:</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={rating >= star ? "star" : "star-outline"}
                      size={40}
                      color="#EF9B0F"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Share your feedback:</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="What did you like or dislike about the service?"
                placeholderTextColor="#666"
                value={comment}
                onChangeText={setComment}
                multiline
                scrollEnabled
                textAlignVertical="top"
                underlineColorAndroid="transparent"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.5 }]}
              onPress={!loading ? submitComments : undefined}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Submitting..." : "Submit Rating"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  shopCardContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
  },
  shopImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  shopInfoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  shopDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  ratingSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  starButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: "#00296B",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  commentSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  commentInput: {
    height: 120,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
  },
});

export default ShopRatingPage;
