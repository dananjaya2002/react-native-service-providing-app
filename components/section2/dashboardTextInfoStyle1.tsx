import React from "react";
import { View, Text } from "react-native";

interface StatusCardProps {
  status?: string;
  count?: number;
  style?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ status = "Waiting", count = 150, style = "" }) => {
  return (
    <View className={`h-auto w-32 flex-col border border-black my-2 rounded-2xl bg-white ${style}`}>
      <Text className="text-sm text-center">{status}</Text>
      <Text className="text-lg text-center font-semibold">{count}</Text>
    </View>
  );
};

export default StatusCard;
