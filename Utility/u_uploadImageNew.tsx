// utilities/cloudinaryUpload.tsx
import React from "react";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";

/**
 * Helper: Extracts the file extension from a URI.
 */
const getFileExtension = (uri: string): string | null => {
  const match = uri.match(/\.(\w+)(\?.*)?$/);
  return match ? "." + match[1].toLowerCase() : null;
};

/**
 * Helper: Determines the MIME type from the file extension.
 */
const getMimeType = (uri: string): string => {
  const ext = getFileExtension(uri);
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    default:
      return "image/jpeg";
  }
};

/**
 * Uploads a local image to Cloudinary and returns its secure URL.
 *
 * @param imageUri - The local URI of the image.
 * @returns A promise that resolves with the secure URL of the uploaded image, or null if the upload fails.
 */
export const uploadImageToCloud = async (imageUri: string): Promise<string | null> => {
  try {
    // Verify that the image file exists.
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      console.error("Image does not exist at:", imageUri);
      return null;
    }

    // Extract filename and MIME type.
    const imageFileName = imageUri.split("/").pop() || "upload.jpg";
    const mimeType = getMimeType(imageUri);

    // Create the FormData payload.
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: mimeType,
      name: imageFileName,
    } as any);
    formData.append("upload_preset", Constants.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET);

    // Construct the Cloudinary upload URL.
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME}/image/upload`;

    // Upload the image.
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (response.ok) {
      console.log("Upload successful:", result);
      return result.secure_url;
    } else {
      console.error("Cloudinary upload error:", result);
      Alert.alert("Upload Error", result.error?.message || "Cloudinary upload failed");
      return null;
    }
  } catch (error: any) {
    console.error("Error uploading image:", error);
    Alert.alert("Upload Error", error.message);
    return null;
  }
};

/**
 * Allows the user to pick an image from the media library and uploads it to Cloudinary.
 */
// export const uploadImage = async (): Promise<void> => {
//   try {
//     // Request permission to access the media library.
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (permissionResult.status !== "granted") {
//       Alert.alert("Permission Required", "Permission to access media library is required!");
//       return;
//     }

//     // Launch the image picker.
//     const pickerResult = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: false,
//       quality: 1,
//     });

//     // Exit if the user cancels.
//     if (pickerResult.canceled) {
//       return;
//     }

//     // Get the first selected image.
//     const selectedAsset = pickerResult.assets && pickerResult.assets[0];
//     if (!selectedAsset) {
//       console.error("No image asset found.");
//       return;
//     }

//     console.log("Selected image URI:", selectedAsset.uri);

//     // Upload the image and retrieve the secure URL.
//     const uploadedUrl = await uploadImageToCloud(selectedAsset.uri);
//     if (uploadedUrl) {
//       console.log("Uploaded image URL:", uploadedUrl);
//       Alert.alert("Upload Successful", "Image uploaded successfully!");
//     }
//   } catch (error: any) {
//     console.error("Error during image selection/upload:", error);
//     Alert.alert("Error", error.message);
//   }
// };
