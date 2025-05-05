import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";

const MyLoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Hello...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 400, // Adjust the width as needed
    height: 400, // Adjust the height as needed
  },
});

export default MyLoadingScreen;
