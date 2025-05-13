import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../FirebaseConfig"; // Import Firebase db instance

type Item = {
  id: string;
  name: string;
  price: string;
  image: string;
};

const MainScreen = () => {
  const [items, setItems] = useState<Item[]>([]);
  // Fetch data from Firestore
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Service"));
      const itemsList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Convert the ID to a number
        name: doc.data().Title, // Assuming 'Title' is the field for the name
        price: "Unknown", // You can add a price field in Firestore or modify as needed
        image: doc.data().ImageURL, // Assuming 'ImageURL' is the field for the image URL
      }));
      setItems(itemsList); // Update the state with the fetched data
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Add a transparent placeholder if the item count is odd
  const data =
    items.length % 2 !== 0
      ? [...items, { id: "placeholder", name: "", price: "", image: "" }]
      : items;

  // Event handler for press events
  const handlePress = (item: Item) => {
    console.log("Item pressed:", item);
  };

  const renderItem = ({ item }: { item: Item }) => {
    if (item.id === "placeholder") {
      // Render a transparent placeholder
      return <View style={styles.placeholder} />;
    }

    return (
      <Pressable style={styles.itemContainer} onPress={() => handlePress(item)}>
        <Image
          source={{ uri: `${item.image}?random=${item.id}` }}
          resizeMode="contain"
          style={styles.image}
        />
        <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={{ padding: 8 }}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    margin: 8,
    padding: 8,
    opacity: 0,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
  },
  itemName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  itemPrice: {
    color: "#718096",
  },
});

export default MainScreen;
