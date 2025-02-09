import React from "react";
import { View, Text, Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface UserCommentProps {
  profileImage: string;
  customerName: string;
  date: string;
  rating: number; // e.g. 4.5 out of 5
  comment: string;
}

const ProductDescriptionScreen: React.FC<UserCommentProps> = ({
  profileImage,
  customerName,
  date,
  rating = 4.5,
  comment,
}) => {
  // Create an array of star icons (full, half, or empty)
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        // Full star
        stars.push(<FontAwesome key={i} name="star" size={16} color="#FFD700" />);
      } else if (rating >= i - 0.5) {
        // Half star (using "star-half-full" for a half-star icon)
        stars.push(<FontAwesome key={i} name="star-half-full" size={16} color="#FFD700" />);
      } else {
        // Empty star
        stars.push(<FontAwesome key={i} name="star-o" size={16} color="#FFD700" />);
      }
    }
    return stars;
  };

  return (
    <View className="flex-1 justify-center bg-primary ">
      <View className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gray-300 mx-3">
        <View className="flex-row items-center mb-2  justify-between">
          <View className="flex-row items-center">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              }}
              className="w-10 h-10 rounded-full"
              resizeMode="cover"
            />
            <View className="ml-3 ">
              <Text className="font-bold text-base">Customer Name</Text>
              <Text className="text-xs text-gray-500">2020.50.10</Text>
            </View>
          </View>
          <View className="flex-row items-center ">
            {renderStars()}
            <Text className="ml-2 text-sm ">{rating.toFixed(1)}</Text>
          </View>
        </View>
        <View className="border-t border-gray-300 mb-1" />
        <View className="bg-gray-50 p-2 rounded-lg shadow-sm">
          <Text className="text-gray-800 text-base leading-tight">
            Amazing service! The team was incredibly responsive and went above and beyond to ensure
            I was satisfied. They even followed up with me a week later to make sure everything was
            still going well. Highly recommend!
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProductDescriptionScreen;
