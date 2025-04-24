import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import ShimmerPlaceHolder, { createShimmerPlaceholder } from "react-native-shimmer-placeholder";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const ShopCardPlaceholder: React.FC = () => {
  // Correctly typing the refs for ShimmerPlaceHolder
  const imageRef = useRef<React.ElementRef<typeof ShimmerPlaceholder>>(null);
  const titleRef = useRef<React.ElementRef<typeof ShimmerPlaceholder>>(null);
  const descriptionRef = useRef<React.ElementRef<typeof ShimmerPlaceholder>>(null);

  useEffect(() => {
    // Adding null checks to avoid runtime errors
    if (imageRef.current && titleRef.current && descriptionRef.current) {
      const animation = Animated.stagger(800, [
        imageRef.current.getAnimated(),
        Animated.parallel([titleRef.current.getAnimated(), descriptionRef.current.getAnimated()]),
      ]);
      Animated.loop(animation).start();
    }
  }, []);

  return (
    <View style={styles.card}>
      <ShimmerPlaceholder
        style={styles.image}
        ref={imageRef}
        stopAutoRun
        shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
      />
      <View style={styles.contentContainer}>
        <ShimmerPlaceholder
          style={styles.title}
          ref={titleRef}
          stopAutoRun
          shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
        />
        <ShimmerPlaceholder
          style={styles.description}
          ref={descriptionRef}
          stopAutoRun
          shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
        />
        <View style={styles.row}>
          <ShimmerPlaceholder
            style={styles.rating}
            shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            stopAutoRun
          />
          <ShimmerPlaceholder
            style={styles.icon}
            shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            stopAutoRun
          />
        </View>
      </View>
    </View>
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
    justifyContent: "space-between",
  },
  title: {
    height: 20,
    width: "70%",
    marginBottom: 4,
    borderRadius: 4,
  },
  description: {
    height: 15,
    width: "90%",
    marginBottom: 4,
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rating: {
    height: 15,
    width: 50,
    borderRadius: 4,
  },
  icon: {
    height: 25,
    width: 25,
    borderRadius: 12,
  },
});

export default ShopCardPlaceholder;
