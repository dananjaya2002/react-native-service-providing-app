import React from "react";
import { View, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export interface UserReviewStarsProps {
  averageRating: number;
  totalRatings: number;
}
const starColor = "#003DE6";
const starSize = 18;

const UserReviewStars: React.FC<UserReviewStarsProps> = ({ averageRating, totalRatings }) => {
  // Render 5 star icons based on the averageRating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (averageRating >= i) {
        // Full star
        stars.push(<FontAwesome key={i} name="star" size={starSize} color={starColor} />);
      } else if (averageRating >= i - 0.5) {
        // Half star
        stars.push(<FontAwesome key={i} name="star-half-full" size={starSize} color={starColor} />);
      } else {
        // Empty star
        stars.push(<FontAwesome key={i} name="star-o" size={starSize} color={starColor} />);
      }
    }
    return stars;
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {renderStars()}
      <Text style={{ marginLeft: 4 }}>({totalRatings})</Text>
    </View>
  );
};

export default UserReviewStars;
