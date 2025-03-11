import React from "react";
import { View, Text, Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Timestamp } from "firebase/firestore";

// TypeScript interfaces
import { UserComment } from "../../interfaces/iShop";

const UserComments: React.FC<UserComment> = ({
  id = "no data",
  profileImageUrl = "no data",
  name = "no data",
  timestamp,
  ratings = 4.5,
  comment = "no data",
  customerId = "no data",
}) => {
  console.log("timestamp:", timestamp);
  // Convert date to ddMMYYYY format
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp || !(timestamp instanceof Timestamp)) {
      return "Unknown date"; // Fallback if timestamp is missing or incorrect
    }
    return timestamp.toDate().toLocaleDateString("en-US", {
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
    <View className="bg-white p-4 rounded-xl shadow-md mb-1 border border-gray-300 mx-3">
      <View className="flex-row items-center mb-2  justify-between">
        <View className="flex-row items-center">
          <Image
            source={{
              uri: profileImageUrl,
            }}
            className="w-10 h-10 rounded-full"
            resizeMode="cover"
          />
          <View className="ml-3 ">
            <Text className="font-bold text-base">{name}</Text>
            <Text className="text-xs text-gray-500">{formatDate(timestamp)}</Text>
          </View>
        </View>
        <View className="flex-row items-center ">
          {renderStars()}
          <Text className="ml-2 text-sm font-bold ">({ratings.toFixed(1)})</Text>
        </View>
      </View>
      <View className="border-t border-gray-300 mb-1" />
      <View className="bg-gray-50 p-2 rounded-lg shadow-sm">
        <Text className="text-gray-800 text-base leading-tight">{comment}</Text>
      </View>
    </View>
  );
};

export default UserComments;
