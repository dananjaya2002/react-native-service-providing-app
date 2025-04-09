// /components/section2/chatComponents/chatAgreement.tsx
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { db } from "../../../FirebaseConfig";

interface ChatAgreementAcceptsCardProps {
  chatRoomDocRefId: string;
  onAccept?: () => void;
  userRole: "customer" | "serviceProvider";
}

const ChatAgreementAcceptsCard: React.FC<ChatAgreementAcceptsCardProps> = ({
  chatRoomDocRefId,
  onAccept,
  userRole,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  // On mount, check if agreement already exists as accepted
  useEffect(() => {
    const checkAgreementStatus = async () => {
      try {
        const docRef = doc(db, "Chat", chatRoomDocRefId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.agreement === "accepted") {
            setAccepted(true);
          }
        }
      } catch (error) {
        console.error("Error checking agreement status:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    checkAgreementStatus();
  }, [chatRoomDocRefId]);

  const handlePress = async () => {
    // Prevent duplicate writes and disable interaction for serviceProvider or during initial loading.
    if (accepted || loading || userRole === "serviceProvider" || initialLoading) return;

    setLoading(true);
    try {
      // Update the Firestore document with new fields.
      const docRef = doc(db, "Chat", chatRoomDocRefId);
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
        {initialLoading || loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{accepted ? "Accepted" : "Accept"}</Text>
        )}
      </Pressable>
    </View>
  );
};

export default ChatAgreementAcceptsCard;

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
