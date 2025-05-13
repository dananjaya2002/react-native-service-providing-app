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
    <View style={[styles.container, { bottom: insets.bottom + 8 }]}>
      <TouchableOpacity style={[styles.leftButton, styles.shadow]} onPress={onLeftPress}>
        <Text style={styles.buttonText}>{leftButtonName}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.rightButton, styles.shadow]} onPress={onRightPress}>
        <Text style={styles.buttonText}>{rightButtonName}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 48,
    flexDirection: "row",
    position: "absolute",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 8,
  },
  leftButton: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(37, 99, 235, 0.9)",
    borderRadius: 12,
    justifyContent: "center",
    marginHorizontal: 8,
  },
  rightButton: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(37, 99, 235, 0.9)",
    borderRadius: 12,
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default FloatingButtonBar;
