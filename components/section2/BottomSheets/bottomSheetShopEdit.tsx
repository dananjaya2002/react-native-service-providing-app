// SlideUpMenu.tsx
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import BottomSheet, { BottomSheetScrollView, BottomSheetFooter } from "@gorhom/bottom-sheet";

interface SlideUpMenuProps {
  isVisible: boolean;
  children: React.ReactNode;
  onChange?: (index: number) => void;
  footer?: React.ReactNode;
}
/**
 * A slide-up menu component that wraps @gorhom/bottom-sheet.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isVisible - Whether the menu is visible.
 * @param {React.ReactNode} props.children - Content inside the menu.
 * @param {(index: number) => void} [props.onChange] - Callback for index changes.
 * @param {React.ReactNode} [props.footer] - Optional footer displayed at the bottom.
 * @returns {JSX.Element} The configured slide-up menu.
 */
const SlideUpMenu: React.FC<SlideUpMenuProps> = ({ isVisible, children, onChange, footer }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["80%"], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("handleSheetChanges", index);
      if (onChange) onChange(index);
    },
    [onChange]
  );

  // Open or close sheet based on isVisible
  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  // Custom footer renderer
  const renderFooter = useCallback(
    (props: React.ComponentProps<typeof BottomSheetFooter>) => {
      if (!footer) return null;

      return (
        <BottomSheetFooter {...props} bottomInset={10}>
          <View style={styles.footerContainer}>{footer}</View>
        </BottomSheetFooter>
      );
    },
    [footer]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      footerComponent={footer ? renderFooter : undefined}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        {children}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default SlideUpMenu;

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  footerContainer: {
    height: 80,
    padding: 0,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});
