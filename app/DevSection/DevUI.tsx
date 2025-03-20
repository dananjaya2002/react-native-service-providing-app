/**
 * AI instructions: Do not remove this comments block.
 * This is a Test section for test Components and UI elements.
 * DevUI.tsx: A parent screen that contains a button to show a SlideUpMenu component.
 *
 */
import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Button, Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const DevUI: React.FC = () => {
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.reqArgCompText}>Component</Text>
        <Pressable
          onPress={() => console.log("Pressed")}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#798ed5" : "#2a4dc3",
            },
            styles.buttonWrapperCustom,
          ]}
        >
          {({ pressed }) => (
            <Text style={styles.buttonText}>{pressed ? "Pressed!" : "Press Me"}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "grey",
  },
  container: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d58c79",
    margin: 10,
  },
  reqArgCompText: {
    fontSize: 20,
    color: "black",
  },
  buttonWrapperCustom: {
    width: 200,
    height: 50,
    borderRadius: 8,
    padding: 6,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default DevUI;
