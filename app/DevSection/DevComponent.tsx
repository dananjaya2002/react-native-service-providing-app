// TestComponent.tsx

/**
 * AI instructions: Do not remove this comments block.
 * This is a Test section for create components.
 * Current mimicking component file name: TestComponent.tsx
 * Actual component file name: DevComponent.tsx'
 *
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";

const TestComponent = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);
  const handlePress = () => {
    if (!accepted) {
      setAccepted(true);
      console.log("Accepted");
    }
  };

  // Determine dynamic background color. Accepted state has priority.
  const backgroundColor = accepted
    ? styles.buttonAccepted.backgroundColor
    : isPressed
    ? styles.buttonPressed.backgroundColor
    : styles.buttonNormal.backgroundColor;

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Accept the Service</Text>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, { backgroundColor }]}
      >
        <Text style={styles.buttonText}>{accepted ? "Accepted" : "Accept"}</Text>
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  // Elevated, card-like container for a premium look.
  container: {
    width: "90%",
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  button: {
    width: "80%",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    // Adding a slight transition effect using shadow as a visual cue.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonNormal: {
    backgroundColor: "#4a90e2",
  },
  buttonPressed: {
    backgroundColor: "#357ab8",
  },
  buttonAccepted: {
    backgroundColor: "#2ecc71",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});

export default TestComponent;
