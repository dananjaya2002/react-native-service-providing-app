import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Image, Text, View, StyleSheet, Alert } from "react-native";
import {
  TapGestureHandler,
  State,
  TapGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ShopList, ShopCategory, ShopLocationCategory } from "../../interfaces/iShop";

interface ShopCardProps {
  item: ShopList;
  onShopClick?: (item: ShopList, event: TapGestureHandlerStateChangeEvent) => void;
  shouldDisplayFavoriteIcon?: boolean;
  onFavoriteClick?: (item: ShopList) => void;
}

const ShopCard: React.FC<ShopCardProps> = ({
  item,
  onShopClick,
  shouldDisplayFavoriteIcon = false, // For Favorite button
  onFavoriteClick, // For Favorite button
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const favoriteRef = useRef<TapGestureHandler>(null);

  const scale = useSharedValue(1);

  // Animated style for scaling the card
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onFavoriteClick && onFavoriteClick(item); // Call the parent function
  };

  useEffect(() => {
    if (shouldDisplayFavoriteIcon) {
      setIsFavorite(true);
    }
  }, [shouldDisplayFavoriteIcon]);

  return (
    <TapGestureHandler
      waitFor={favoriteRef}
      onHandlerStateChange={(gestureEvent: TapGestureHandlerStateChangeEvent) => {
        const { state } = gestureEvent.nativeEvent;
        if (state === State.BEGAN) {
          scale.value = withTiming(0.95, { duration: 100 });
        } else if (state === State.ACTIVE) {
          scale.value = withTiming(1, { duration: 100 });
          onShopClick && onShopClick(item, gestureEvent);
        } else {
          scale.value = withTiming(1, { duration: 100 });
        }
      }}
      maxDeltaX={10}
      maxDeltaY={10}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: item.shopPageImageUrl }} style={styles.image} />
        <View style={styles.contentContainer}>
          <View style={styles.subContainer}>
            <Text style={styles.titleText}>{item.shopName}</Text>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.shopDescription}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.avgRating.toFixed(1)}</Text>
            </View>
            {shouldDisplayFavoriteIcon && (
              <TapGestureHandler
                ref={favoriteRef}
                onHandlerStateChange={({ nativeEvent }: TapGestureHandlerStateChangeEvent) => {
                  if (nativeEvent.state === State.ACTIVE) {
                    toggleFavorite();
                  }
                }}
              >
                <View style={styles.favoriteButton}>
                  {isFavorite ? (
                    <Ionicons name="heart" size={25} color="red" />
                  ) : (
                    <Ionicons name="heart-outline" size={25} color="gray" />
                  )}
                </View>
              </TapGestureHandler>
            )}
          </View>
        </View>
      </Animated.View>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 130,
    width: "100%",
    alignItems: "center",
    marginBottom: 4,
    marginHorizontal: 0,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 0,
    marginRight: 8,
  },
  contentContainer: {
    flex: 1,
    height: "100%",

    justifyContent: "space-between",
  },
  subContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingContainer: {
    paddingBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "bold",
    marginLeft: 4,
  },
  favoriteButton: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
  },
});

export default ShopCard;
