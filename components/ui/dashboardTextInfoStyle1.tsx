import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface StatusCardProps {
  status?: string;
  count?: string | number;
  style?: ViewStyle;
}

const StatusCard: React.FC<StatusCardProps> = ({ status = "Waiting", count = 150, style = {} }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.statusText}>{status}</Text>
      <Text style={styles.countText}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "auto",
    width: 128,
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "black",
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: "white",
  },
  statusText: {
    fontSize: 14,
    textAlign: "center",
  },
  countText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default StatusCard;
