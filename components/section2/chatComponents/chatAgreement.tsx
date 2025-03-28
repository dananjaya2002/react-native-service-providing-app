// /components/section2/chatComponents/chatAgreement.tsx
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { db } from "../../../FirebaseConfig";

interface ChatAgreementCardProps {
  chatDocId: string;
  onAccept?: () => void;
}

const ChatAgreementCard: React.FC<ChatAgreementCardProps> = ({ chatDocId, onAccept }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const handlePress = async () => {
    // Prevent duplicate writes
    if (accepted || loading) return;

    setLoading(true);
    try {
      // Update the Firestore document with new fields.
      const docRef = doc(db, "Chat", chatDocId);
      await updateDoc(docRef, {
        agreement: "accepted",
        acceptedTime: serverTimestamp(),
      });
      setAccepted(true);
      if (onAccept) onAccept();
    } catch (error) {
      console.error("Error accepting agreement:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine dynamic background color; accepted state has priority.
  const backgroundColor = accepted
    ? styles.buttonAccepted.backgroundColor
    : isPressed
    ? styles.buttonPressed.backgroundColor
    : styles.buttonNormal.backgroundColor;

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Accept the Service</Text>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={accepted || loading}
        style={[styles.button, { backgroundColor }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{accepted ? "Accepted" : "Accept"}</Text>
        )}
      </Pressable>
    </View>
  );
};

export default ChatAgreementCard;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  button: {
    width: "80%",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonNormal: {
    backgroundColor: "#4a90e2",
  },
  buttonPressed: {
    backgroundColor: "#357ab8",
  },
  buttonAccepted: {
    backgroundColor: "#2ecc71",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
