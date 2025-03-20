import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ButtonProps {
  leftButtonName: string;
  rightButtonName: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

const FloatingButtonBar: React.FC<ButtonProps> = ({
  leftButtonName = "LB",
  rightButtonName = "RB",
  onLeftPress,
  onRightPress = () => console.log("Right button pressed!"),
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="w-full h-16 flex-row absolute items-center justify-evenly px-2"
      style={[{ bottom: insets.bottom + 8 }]}
    >
      <TouchableOpacity
        className="flex-1 h-full bg-blue-600/90 px-4 py-3 rounded-3xl w-28 justify-center mx-2"
        style={[styles.shadow]}
        onPress={onLeftPress}
      >
        <Text className="text-white font-bold text-lg text-center">{leftButtonName}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 h-full bg-blue-600/90 px-4 py-3 rounded-3xl justify-center "
        style={[styles.shadow]}
        onPress={onRightPress}
      >
        <Text className="text-white font-bold text-center text-lg">{rightButtonName}</Text>
      </TouchableOpacity>
      {/* You can add more buttons here */}
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default FloatingButtonBar;
