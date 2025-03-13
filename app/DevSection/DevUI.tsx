// DevUI.tsx: A parent screen that contains a button to show a SlideUpMenu component.
import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, Button, TextInput, Text, StyleSheet, BackHandler } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SlideUpMenu, { SlideUpMenuHandle } from "./DevComponont";

const ParentScreen: React.FC = () => {
  const slideUpMenuRef = useRef<SlideUpMenuHandle>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Callback from SlideUpMenu: when index is -1, the sheet is closed.
  const handleSheetChange = useCallback((index: number) => {
    setSheetOpen(index !== -1);
    console.log("Sheet index changed:", index);
  }, []);

  // Back button handling: if sheet is open, close it and prevent default back action.
  useEffect(() => {
    const onBackPress = () => {
      if (sheetOpen) {
        slideUpMenuRef.current?.close();
        return true; // Prevent default behavior
      }
      return false; // Allow default back action
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [sheetOpen]);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Button title="Show Slide Up Menu" onPress={() => slideUpMenuRef.current?.open()} />
      </View>
      <SlideUpMenu ref={slideUpMenuRef} onChange={handleSheetChange}>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Enter Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Button title="Close Menu" onPress={() => slideUpMenuRef.current?.close()} />
        </View>
      </SlideUpMenu>
    </View>
  );
};

export default ParentScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f2f2f2" },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  menuContent: {
    padding: 20,
    backgroundColor: "#fff",
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  multilineInput: {
    height: 80,
  },
});
