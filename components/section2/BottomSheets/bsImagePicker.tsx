import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Pressable, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImagePickerBoxProps {
  initialImage?: string;
  onImageChange?: (uri: string | null) => void;
}

const ImagePickerBox: React.FC<ImagePickerBoxProps> = ({ initialImage = null, onImageChange }) => {
  const [image, setImage] = useState<string | null>(null);

  // Update state when initialImage prop changes
  useEffect(() => {
    setImage(initialImage);
  }, [initialImage]);

  const pickImage = async () => {
    // Launch the image library with only images allowed
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Only images, no videos
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });

    console.log(result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.box} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Tap to select an image</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  box: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholderText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
});

export default ImagePickerBox;
