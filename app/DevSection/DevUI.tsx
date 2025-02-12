import { updateItemList } from "./utilities/updateItemList";

import { View, Text } from "react-native";
import React, { useEffect } from "react";

const DevUI = () => {
  useEffect(() => {
    updateItemList("your-document-id"); // replace with your actual document ID
  }, []);
  return (
    <View>
      <Text>DevUI</Text>
    </View>
  );
};

export default DevUI;
