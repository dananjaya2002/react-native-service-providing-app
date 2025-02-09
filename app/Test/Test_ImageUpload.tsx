import React from "react";
import { Button, View, Image, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import Constants from "expo-constants";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

import { uploadImage, readUploadLog } from "../../Utility/u_uploadImage";

const UploadScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View className="m-5">
        <Button title="Upload Image" onPress={uploadImage} />
      </View>
      <View className="m-5">
        <Button title="Read Upload Logs" onPress={readUploadLog} />
      </View>
    </View>
  );
};

export default UploadScreen;
