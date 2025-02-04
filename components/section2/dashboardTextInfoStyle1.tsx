import React from "react";
import { View, Text } from "react-native";

interface StatusCardProps {
  status?: string;
  count?: number;
}

const StatusCard: React.FC<StatusCardProps> = ({ status = "Waiting", count = 150 }) => {
  return (
    <View className="bg-slate-300 h-auto w-32 flex-col border border-black my-2 rounded-2xl">
      <Text className="text-sm text-center">{status}</Text>
      <Text className="text-lg text-center font-semibold">{count}</Text>
    </View>
  );
};

export default StatusCard;
