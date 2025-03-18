// SlideUpMenu.tsx

/**
 * AI instructions: Do not remove this comments block.
 * This is a Test section for create components.
 * Current mimicking component file name: SlideUpMenu.tsx
 * Actual component file name: DevComponent.tsx'
 *
 */
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

interface SlideUpMenuProps {
  isVisible: boolean;
  children: React.ReactNode;
  onChange?: (index: number) => void;
}

const SlideUpMenu: React.FC<SlideUpMenuProps> = ({ isVisible, children, onChange }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["100%"], []);

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
      bottomSheetRef.current?.snapToIndex(0); // Open the sheet (index 1)
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1} // -1 means closed
      snapPoints={snapPoints}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableBlurKeyboardOnGesture={false}
      enableDynamicSizing={false}
      enablePanDownToClose={false} // Parent controls the state
      onChange={handleSheetChanges}
    >
      {children}
    </BottomSheet>
  );
};

export default SlideUpMenu;
