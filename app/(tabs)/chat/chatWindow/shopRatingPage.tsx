import React, { useEffect, useState } from "react";
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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import HeaderMain from "@/components/ui/header_Main";
import { UserStorageService } from "../../../../storage/functions/userStorageService";
import { UserData } from "../../../../interfaces/UserData";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../FirebaseConfig";
import { router, useLocalSearchParams } from "expo-router";
import { ShopList } from "@/interfaces/iShop";
import { getShopCardData, uploadUserRatings } from "@/utility/u_uploadUserRatings";
import {
  IUserRatingsFirebaseDocument,
  IUserRatingUploadParams,
} from "../../../../interfaces/iUserRatings";

const ShopRatingPage = () => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [shopCard, setShopCard] = useState<ShopList | null>(null);

  const { serviceProviderId } = useLocalSearchParams<{
    serviceProviderId: string;
  }>();

  const handleStarPress = (star: number) => {
    setRating(star);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!serviceProviderId) {
          console.error("Service Provider ID is missing");
          return;
        }
        const tempShopCardData = await getShopCardData(serviceProviderId);
        const tempUserData = await UserStorageService.getUserData();
        console.log("tempShopCardData", tempShopCardData);
        console.log("tempUserData", tempUserData);
        if (tempShopCardData === null) {
          console.error("Error fetching shop card data");
        } else if (tempUserData === null) {
          console.error("Error fetching user data");
        } else {
          setShopCard(tempShopCardData);
          setUserData(tempUserData);
        }
      } catch (error) {
        console.error("Error fetching Shop Data:", error);
      }
    };
    fetchUserData();
  }, [serviceProviderId]);

  const submitComments = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    if (comment.trim().length === 0) {
      alert("Comment cannot be empty");
      return;
    }
    if (!shopCard) {
      console.error("ShopCard data not found");
      alert("ShopCard data not found");
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
      alert("Rating submitted successfully");
      setRating(0);
      setComment("");
      setLoading(false);
      // Navigate back to the previous screen after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);
    } else {
      setLoading(false);
      alert("Error submitting rating");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2F3F4" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 90}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ justifyContent: "flex-end" }}>
          {/* Header Section */}
          <HeaderMain
            title="Rate the Service"
            onPressBack={() => router.back()}
            showProfileIcon={true}
            showLogoutButton={false}
          />

          <View style={styles.headerContainer}>
            <Image
              style={styles.headerImage}
              source={{
                uri: shopCard?.shopPageImageUrl || "https://placehold.co/400x200?text=No+Image", // Replace 400x200 with your desired dimensions
              }}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>{shopCard?.shopName || "loading.."}</Text>
            </View>
          </View>
          {/* Content Section */}
          <View style={styles.contentContainer}>
            <Text style={styles.subtitle}>Share your feedback and rate your experience</Text>
            {/* Comment Input */}
            <TextInput
              style={styles.commentInput}
              placeholder="Add your comment..."
              placeholderTextColor="#888"
              value={comment}
              onChangeText={setComment}
              multiline
              scrollEnabled
              textAlignVertical="top"
              underlineColorAndroid="transparent"
            />
            {/* 5-Star Rating */}
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                  <Ionicons
                    name={rating >= star ? "star" : "star-outline"}
                    size={36}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
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
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ShopRatingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2", // Light gray background
  },
  headerContainer: {
    flexDirection: "row",
    backgroundColor: "#22c55e", // Green-500
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    padding: 8,
  },
  headerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#facc15", // Yellow-300
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 16,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  contentContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
  },
  commentInput: {
    height: 100, // Fixed height prevents runaway growth
    maxHeight: 150, // Allows scrolling when content exceeds this height
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
