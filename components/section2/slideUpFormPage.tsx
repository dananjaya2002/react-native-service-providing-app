import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  BackHandler,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";

/**
 * Get screen dimensions and calculate target positions.
 */
const { height: screenHeight } = Dimensions.get("window");
const sheetHeight = screenHeight * 0.9; // Cover 80% of the screen height.
const openPosition = screenHeight - sheetHeight; // Start Position to slide up to.

/**
 * ---- UpdateSheet component ----
 *
 * Props:
 * @property {string} [title] - Optional initial title value.
 * @property {string} [description] - Optional initial description value.
 * @property {string} [phoneNumber] - Optional initial phone number.
 * @property {string} [category] - Optional initial category.
 *
 * Callbacks:
 * @property {function} onUpdate - Callback fired when the "Updated" button is pressed.
 *         Outputs an object with updated values: { title, description, phoneNumber, category }.
 * @property {function} [onOpen] - Optional callback fired when the sheet is opened.
 * @property {function} [onClose] - Optional callback fired when the sheet is closed.
 *
 * Outputs via ref:
 * Exposes two methods to parent components:
 *    - open(): Slides the sheet up.
 *    - close(): Slides the sheet down.
 */
type UpdateSheetProps = {
  title?: string;
  description?: string;
  phoneNumber?: string;
  category?: string;
  onUpdate: (data: {
    title: string;
    description: string;
    phoneNumber: string;
    category: string;
  }) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * Interface for methods exposed to parent components via ref.
 * The parent can call these to control the sheet.
 */
export interface UpdateSheetRef {
  open: () => void; // Slide up the sheet.
  close: () => void; // Slide down the sheet.
}

/**
 * UpdateSheet Component
 *
 * A slide-up form component that allows a user to update details.
 * It uses React Native Reanimated for smooth sliding animations,
 * and exposes `open` and `close` methods via a ref so that a parent
 * component can control its behavior.
 *
 * @param {UpdateSheetProps} props - The props for this component.
 * @param {React.Ref<UpdateSheetRef>} ref - Ref to expose imperative methods.
 * @returns {JSX.Element}
 */

/**
 * UpdateSheet component uses forwardRef so that a parent can get a ref and call its methods.
 * The generic types ensure that the ref has open() and close() methods (defined in UpdateSheetRef),
 * and that the component accepts props defined in UpdateSheetProps.
 */
const UpdateSheet = forwardRef<UpdateSheetRef, UpdateSheetProps>(
  (
    {
      // Destructure props with default values for initial state.
      title: initialTitle = "",
      description: initialDescription = "",
      phoneNumber: initialPhoneNumber = "",
      category: initialCategory = "",
      onUpdate,
      onOpen,
      onClose,
    },
    ref
  ) => {
    /** Local state for form inputs. */
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
    const [category, setCategory] = useState(initialCategory);

    /** Local state to track if the sheet is open. */
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    /** Shared value for vertical translation (animation). */
    const translateY = useSharedValue(screenHeight);

    /**
     * Slide up the sheet.
     * Animates the sheet to the open position, sets the open state,
     * and calls the onOpen callback if provided.
     */
    const handleSlideUp = () => {
      translateY.value = withTiming(openPosition, { duration: 300 });
      setIsSheetOpen(true);
      onOpen && onOpen();
    };

    /**
     * Slide down the sheet.
     * Animates the sheet off-screen, resets the open state,
     * and calls the onClose callback if provided.
     */
    const handleSlideDown = () => {
      translateY.value = withTiming(screenHeight, { duration: 300 });
      setIsSheetOpen(false);
      onClose && onClose();
    };

    /**
     * Expose `open` and `close` methods to the parent component via ref.
     * These methods allow the parent to control the slide-up and slide-down behavior.
     * From the parent, Calling sheetRef.current.open() / .close() will run handleSlideUp/Down,
     */
    useImperativeHandle(ref, () => ({
      open: handleSlideUp,
      close: handleSlideDown,
    }));

    /** Create an animated style that moves the sheet vertically. */
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    /**
     * Effect to handle the Android hardware back button.
     * When the sheet is open, pressing the back button will trigger it to close.
     */
    useEffect(() => {
      const onBackPress = () => {
        if (isSheetOpen) {
          handleSlideDown();
          return true; // Prevent default behavior.
        }
        return false;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove(); // Cleanup the event listener.
    }, [isSheetOpen]);

    /**
     * Handle the "Updated" button press.
     * Sends the current form data to the onUpdate callback and closes the sheet.
     */
    const handleUpdate = () => {
      onUpdate({ title, description, phoneNumber, category });
      handleSlideDown(); // Close the sheet.
    };

    return (
      <>
        {/* Overlay: Tapping outside the sheet closes it */}
        {isSheetOpen && (
          <TouchableWithoutFeedback onPress={handleSlideDown}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}

        {/* Animated slide-up sheet */}
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <View style={styles.sheetContent}>
            <Text style={styles.header}>Update Details</Text>
            <KeyboardAwareScrollView bottomOffset={84}>
              <View className="h-32"></View>
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
              <View className="h-8"></View>
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
            </KeyboardAwareScrollView>
            {/* <KeyboardToolbar doneText={"Complete"} /> */}
          </View>
        </Animated.View>
      </>
    );
  }
);

/**
 * Styles for the UpdateSheet component.
 */
const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
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

export default UpdateSheet;
