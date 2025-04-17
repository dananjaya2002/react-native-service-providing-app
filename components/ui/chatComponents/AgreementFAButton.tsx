import React, { useEffect, useState } from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../FirebaseConfig"; // adjust the path as needed

interface AgreementFAButtonProps {
  onPress?: () => void;
  chatRoomDocRefId: string;
}

const AgreementFAButton: React.FC<AgreementFAButtonProps> = ({ onPress, chatRoomDocRefId }) => {
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentDate, setSentDate] = useState<Date | null>(null);

  // On mount, check the Firestore document for existing agreement status.
  useEffect(() => {
    const fetchAgreementStatus = async () => {
      try {
        const docRef = doc(db, "Chat", chatRoomDocRefId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Check for either accepted or sended status.
          if (data.agreement === "accepted" || data.agreement === "sended") {
            setIsSent(true);
            if (data.acceptedTime) {
              setSentDate(data.acceptedTime.toDate());
            } else if (data.sendedTime) {
              setSentDate(data.sendedTime.toDate());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching agreement status:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgreementStatus();
  }, [chatRoomDocRefId]);

  const handlePress = async () => {
    if (isSent) return;
    setLoading(true);
    try {
      const docRef = doc(db, "Chat", chatRoomDocRefId);
      // Update the document with agreement fields.
      await updateDoc(docRef, {
        agreement: "sended",
        sendedTime: serverTimestamp(),
      });
      // After updating, fetch the doc to get the server timestamp value.
      const updatedSnap = await getDoc(docRef);
      const updatedData = updatedSnap.data();
      if (updatedData?.sendedTime) {
        setSentDate(updatedData.sendedTime.toDate());
      }
      setIsSent(true);
      if (onPress) onPress();
    } catch (error) {
      console.error("Error updating agreement:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={[styles.fab, isSent ? styles.sentFab : styles.initialFab]}
        onPress={handlePress}
        disabled={isSent || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.fabText}>{isSent ? "Agreement Sent" : "Send Agreement"}</Text>
        )}
      </Pressable>
      {isSent && sentDate && (
        <Text style={styles.dateText}>
          {`Sent:  ${sentDate.toLocaleDateString()} ${sentDate.getHours()}:${
            sentDate.getMinutes() < 10 ? "0" : ""
          }${sentDate.getMinutes()}`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    backgroundColor: "rgba(244,244,244,0.8)",
    position: "absolute",
    paddingVertical: 5,
    top: 60,
    right: 0,
    left: 0,
    zIndex: 1,
    borderBottomColor: "rgba(213,213,213,1)",
    borderBottomWidth: 1,
  },
  fab: {
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 250,
    minHeight: 40,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  initialFab: {
    backgroundColor: "#2a4dc3",
  },
  sentFab: {
    backgroundColor: "#798ed5",
  },
  fabText: {
    color: "white",
    fontSize: 13,
  },
  dateText: {
    marginTop: 5,
    fontSize: 11,
    color: "#555",
  },
});

export default AgreementFAButton;
