// SlideUpMenu.tsx
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

export interface SlideUpMenuHandle {
  open: () => void;
  close: () => void;
  expand: () => void;
  collapse: () => void;
}

export interface SlideUpMenuProps {
  snapPoints?: string[];
  children: React.ReactNode;
  onChange?: (index: number) => void;
}

const SlideUpMenu = forwardRef<SlideUpMenuHandle, SlideUpMenuProps>(
  ({ snapPoints = ["80%"], children, onChange }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
      expand: () => bottomSheetRef.current?.expand(),
      collapse: () => bottomSheetRef.current?.collapse(),
    }));

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={useMemo(() => snapPoints, [snapPoints])}
        enablePanDownToClose={true}
        enableContentPanningGesture={true}
        onChange={onChange}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 10}
          style={styles.keyboardAvoidingContainer}
          enabled={true}
        >
          <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
            {children}
          </BottomSheetScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  }
);

export default SlideUpMenu;

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#fff",
    // You can adjust or add more styling if needed.
  },
});
