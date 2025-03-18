/**
 * AI instructions: Do not remove this comments block.
 * This is a Test section for test Components and UI elements.
 * DevUI.tsx: A parent screen that contains a button to show a SlideUpMenu component.
 *
 */
import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import SlideUpMenu from "./DevComponent"; // Adjust the import path as needed
import { BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";

const DevUI: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = useCallback(() => {
    setMenuVisible((prev) => !prev);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Button title={menuVisible ? "Hide Menu" : "Show Menu"} onPress={toggleMenu} />
      </View>
      <SlideUpMenu isVisible={menuVisible}>
        <BottomSheetTextInput style={styles.input} placeholder="Input 1" />
        <BottomSheetView style={styles.contentContainer}>
          <Text style={styles.text}>Awesome 🎉</Text>
        </BottomSheetView>
        <BottomSheetTextInput style={styles.input} placeholder="Input 2" />
        <Text style={styles.text}>Awesome 🎉</Text>
        <BottomSheetTextInput style={styles.input} placeholder="Input 3" />
        <Text style={styles.text}>Awesome 🎉</Text>
        <BottomSheetTextInput style={styles.input} placeholder="Input 4" />
      </SlideUpMenu>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "grey",
  },
  container: {
    padding: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: "rgba(151, 151, 151, 0.25)",
  },
});

export default DevUI;
