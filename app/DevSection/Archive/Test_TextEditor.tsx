import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  BackHandler,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

interface Props {
  title?: string;
  description?: string;
  phoneNumber?: string;
  category?: string;
}

const { height: screenHeight } = Dimensions.get("window");
const sheetHeight = screenHeight * 0.8; // The sheet covers 80% of the screen height.
const openPosition = screenHeight - sheetHeight; // Top of the sheet when open

const App: React.FC<Props> = ({
  title: initialTitle = "",
  description: initialDescription = "",
  phoneNumber: initialPhoneNumber = "",
  category: initialCategory = "",
}) => {
  // Form state initialized with props
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [category, setCategory] = useState(initialCategory);

  // Used to track whether the sheet is open
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Start with the sheet off-screen (below the screen).
  const translateY = useSharedValue(screenHeight);

  // Slide the sheet up
  const handleSlideUp = () => {
    translateY.value = withTiming(openPosition, { duration: 300 });
    setIsSheetOpen(true);
  };

  // Slide the sheet down
  const handleSlideDown = () => {
    translateY.value = withTiming(screenHeight, { duration: 300 });
    setIsSheetOpen(false);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Handle the Android back button when the sheet is open
  useEffect(() => {
    const onBackPress = () => {
      if (isSheetOpen) {
        handleSlideDown();
        return true; // prevent default back behavior
      }
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [isSheetOpen]);

  const handleUpdate = () => {
    // Replace this with your update logic
    console.log("Updated values:", { title, description, phoneNumber, category });
    // Optionally close the sheet after update
    handleSlideDown();
  };

  return (
    <View style={styles.container}>
      <Button title="Show Sheet" onPress={handleSlideUp} />

      {/* Overlay that dismisses the sheet on press */}
      {isSheetOpen && (
        <TouchableWithoutFeedback onPress={handleSlideDown}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sheet, animatedStyle]}>
        <View style={styles.sheetContent}>
          <Text style={styles.header}>Update Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#888"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Category"
            placeholderTextColor="#888"
            value={category}
            onChangeText={setCategory}
          />

          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Updated</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#577be5",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: sheetHeight,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  sheetContent: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#577be5",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default App;
