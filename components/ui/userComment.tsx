import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Timestamp } from "firebase/firestore";

// TypeScript interfaces
import { UserComment } from "../../interfaces/iShop";

const UserComments: React.FC<UserComment> = ({
  id = "no data",
  profileImageUrl = "no data",
  name = "no data",
  uploadedDate,
  ratings = 4.5,
  comment = "no data",
  customerId = "no data",
}) => {
  // Convert date to ddMMYYYY format
  const formatDate = (uploadedDate: Timestamp) => {
    if (!uploadedDate || !(uploadedDate instanceof Timestamp)) {
      return "Unknown date"; // Fallback if uploadedDate is missing or incorrect
    }
    return uploadedDate.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const starColor = "#003DE6";
  const starSize = 18;

  // Create an array of star icons (full, half, or empty)
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (ratings >= i) {
        // Full star
        stars.push(<FontAwesome key={i} name="star" size={starSize} color={starColor} />);
      } else if (ratings >= i - 0.5) {
        // Half star (using "star-half-full" for a half-star icon)
        stars.push(<FontAwesome key={i} name="star-half-full" size={starSize} color={starColor} />);
      } else {
        // Empty star
        stars.push(<FontAwesome key={i} name="star-o" size={starSize} color={starColor} />);
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* First Column - Profile Image */}
        <Image
          source={{
            uri: profileImageUrl,
          }}
          style={styles.profileImage}
          resizeMode="cover"
        />

        {/* Second Column - Name and Date/Ratings */}
        <View style={styles.contentContainer}>
          {/* Row 1 - Name */}
          <Text style={styles.userName}>{name}</Text>

          {/* Row 2 - Date and Ratings */}
          <View style={styles.secondRowContainer}>
            {/* Column 1 - Date */}
            <Text style={styles.dateText}>{formatDate(uploadedDate)}</Text>

            {/* Column 2 - Ratings */}
            <View style={styles.ratingsContainer}>
              {renderStars()}
              <Text style={styles.ratingText}>({ratings.toFixed(1)})</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.commentContainer}>
        <Text style={styles.commentText}>{comment}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  secondRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#6b7280",
  },
  ratingsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  divider: {
    borderTopWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 4,
  },
  commentContainer: {
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentText: {
    color: "#1f2937",
    fontSize: 16,
    lineHeight: 20,
  },
});

export default UserComments;
