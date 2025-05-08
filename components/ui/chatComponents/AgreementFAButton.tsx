import React, { useEffect, useState } from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { doc, getDoc, updateDoc, serverTimestamp, writeBatch } from "firebase/firestore";
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
        const chatDocRef = doc(db, "Chat", chatRoomDocRefId);
        const moreInfoDocRef = doc(db, "Chat", chatRoomDocRefId, "ChatRoomMoreInfo", "agreement");

        // Fetch both documents in parallel
        const [chatDocSnap, moreInfoDocSnap] = await Promise.all([
          getDoc(chatDocRef),
          getDoc(moreInfoDocRef),
        ]);

        // Check main chat document
        if (chatDocSnap.exists()) {
          const chatData = chatDocSnap.data();
          if (chatData.agreement === "accepted" || chatData.agreement === "sended") {
            setIsSent(true);
            if (chatData.acceptedTime) {
              setSentDate(chatData.acceptedTime.toDate());
            } else if (chatData.sendedTime) {
              setSentDate(chatData.sendedTime.toDate());
            }
          }
        }

        // Also check the agreement document in the subcollection
        if (!isSent && moreInfoDocSnap.exists()) {
          const moreInfoData = moreInfoDocSnap.data();
          if (moreInfoData.agreement === "accepted" || moreInfoData.agreement === "sended") {
            setIsSent(true);
            if (moreInfoData.acceptedTime) {
              setSentDate(moreInfoData.acceptedTime.toDate());
            } else if (moreInfoData.sendedTime) {
              setSentDate(moreInfoData.sendedTime.toDate());
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
      const moreInfoDocRef = doc(db, "Chat", chatRoomDocRefId, "ChatRoomMoreInfo", "agreement");

      // Create a batch
      const batch = writeBatch(db);

      // Add both operations to the batch
      batch.update(docRef, {
        agreement: "sended",
        sendedTime: serverTimestamp(),
      });

      batch.set(moreInfoDocRef, {
        agreement: "sended",
        sendedTime: serverTimestamp(),
      });

      // Commit the batch
      await batch.commit();

      // After updating, fetch the doc to get the server timestamp value
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
