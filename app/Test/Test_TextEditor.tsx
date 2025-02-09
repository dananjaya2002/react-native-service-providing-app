import React, { useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  Button,
  StyleSheet,
  View,
  useWindowDimensions,
  TextInput,
  Text,
} from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import RenderHTML from "react-native-render-html";

const ProductDescriptionScreen: React.FC = () => {
  const [description, setDescription] = useState("");
  const [output, setOutput] = useState("");
  const handleInputChange = (text: React.SetStateAction<string>) => {
    setDescription(text);
  };

  const handleSave = () => {
    // Here you would save the 'description' to your storage (e.g., AsyncStorage, database)
    console.log("Description to save:", description);
    setDescription("🛒 Fresh Produce\n• Apples\n• Bananas\n😊 Friendly Service!");

    // You'd typically call an API or local storage function here.
  };

  return (
    <View className="bg-white p-4 flex-1">
      <TextInput
        className="text-left align-top justify-start border-e-red-400 border-2 p-3 min-h-40"
        multiline={true} // Allow multiple lines
        placeholder="Enter your description (with emojis and bullet points)"
        value={description}
        onChangeText={handleInputChange}
        textAlignVertical="top" // Important for multiline
      />
      <Button title="Save Description" onPress={handleSave} />
      <View className="w-full h-auto p-3">
        <Text className="bg-slate-200">
          {`Shop at Joe's Fresh Market! 🛒🥦 Fresh produce 🛍️ Daily essentials 😊 Friendly service\n
  Located in the heart of the neighborhood, Joe's Fresh Market is your go-to spot for all\n
  your grocery needs!`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    minHeight: 100, //Adjust as needed
    textAlignVertical: "top",
  },
});

export default ProductDescriptionScreen;
