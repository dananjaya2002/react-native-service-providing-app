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
import HeaderMain from "@/components/section2/header_Main";
import { UserStorageService } from "../../storage/functions/userStorageService";
import { UserData } from "../../interfaces/UserData";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

const ShopRatingPage = () => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleStarPress = (star: number) => {
    setRating(star);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserData(await UserStorageService.getUserData());
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const submitComments = async () => {
    setLoading(true);
    try {
      if (!userData) {
        throw new Error("User data not found");
      }

      // Define the collection reference (auto-generated document ID will be used)
      const userCommentsRef = collection(
        db,
        "Users",
        userData.userId,
        "Shop",
        "ShopPageInfo",
        "UserComments"
      );

      // Create the document data
      const commentData = {
        comment: comment,
        customerId: userData.userId,
        name: userData.userName,
        profileImageUrl: userData.profileImageUrl,
        ratings: rating,
        timestamp: serverTimestamp(),
      };

      // Upload the comment data to Firestore
      await addDoc(userCommentsRef, commentData);

      // Optionally, clear the input after successful submission
      setComment("");
      setRating(0);
    } catch (error) {
      console.error("Error uploading comment:", error);
      // Optionally, display an error message to the user
    } finally {
      setLoading(false);
    }
  };

  const windowHeight = Dimensions.get("window").height;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2F3F4" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 90}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ justifyContent: "flex-end" }}>
          {/* Header Section */}

          <View style={styles.headerContainer}>
            <Image
              style={styles.headerImage}
              source={{
                uri: "https://cdn.pixabay.com/photo/2025/01/30/13/03/welding-9370143_960_720.jpg",
              }}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>Shop Name</Text>
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
            <TouchableOpacity style={styles.submitButton} onPress={() => submitComments()}>
              <Text style={styles.submitButtonText}>Submit Rating</Text>
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
