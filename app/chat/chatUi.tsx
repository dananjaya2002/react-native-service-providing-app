import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";

type Message = {
  id: number;
  type: "send" | "receive";
  text?: string;
  image?: string;
  timestamp: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const flatListRef = useRef<FlatList>(null);

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((msgs) => [
        {
          id: Date.now(),
          type: "receive",
          text: `Hey! How are you? (Item ID: ${itemId})`,
          timestamp: formatTimestamp(),
        },
        ...msgs,
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [itemId]);

  useEffect(() => {
    setIsTyping(message.length > 0);
  }, [message]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  }, [messages]);

  const sendMsg = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      type: "send",
      text: message.trim(),
      timestamp: formatTimestamp(),
    };

    setMessages((prev) => [newMessage, ...prev]);
    setMessage("");
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      sendImage(imageUri);
    }
  };

  const sendImage = (imageUri: string) => {
    const newMessage: Message = {
      id: Date.now(),
      type: "send",
      image: imageUri,
      timestamp: formatTimestamp(),
    };

    setMessages((prev) => [newMessage, ...prev]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.chatItemCommon,
              item.type === "send" ? styles.send : styles.receive,
            ]}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
              <Text
                style={
                  item.type === "send" ? styles.sendText : styles.receiveText
                }
              >
                {item.text}
              </Text>
            )}
            <Text
              style={[
                styles.timestamp,
                item.type === "send" && styles.sendTimestamp,
              ]}
            >
              {item.timestamp}
            </Text>
          </View>
        )}
        inverted
        contentContainerStyle={styles.listStyle}
      />

      <View style={styles.bottom}>
        {isTyping && (
          <ActivityIndicator
            style={styles.typingIndicator}
            size="small"
            color="#888"
          />
        )}
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <MaterialIcons name="image" size={24} color="#007BFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={message}
          placeholder="Type your message"
          onChangeText={setMessage}
          onSubmitEditing={sendMsg}
        />
        <TouchableOpacity
          onPress={sendMsg}
          disabled={!message.trim()}
          style={{ opacity: message.trim() ? 1 : 0.5 }}
        >
          <Text
            style={[
              styles.sendButton,
              !message.trim() && styles.disabledButton,
            ]}
          >
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  bottom: {
    backgroundColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    fontSize: 18,
    color: "#007BFF",
  },
  chatItemCommon: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  send: {
    alignSelf: "flex-end",
    backgroundColor: "#007BFF",
  },
  receive: {
    alignSelf: "flex-start",
    backgroundColor: "#ddd",
  },
  sendText: {
    fontSize: 16,
    color: "white",
  },
  receiveText: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#aaa",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  sendTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  listStyle: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  typingIndicator: {
    marginRight: 10,
  },
  disabledButton: {
    color: "#ccc",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  imageButton: {
    marginRight: 10,
    padding: 10,
  },
  imageButtonText: {
    fontSize: 24,
  },
});
