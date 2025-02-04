import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { items } from "../../assets/Data/data";
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
      return <View className="flex-1 m-2 p-2 opacity-0" />;
    }

    return (
      <Pressable
        className="flex-1 m-2 p-2 bg-white rounded-xl shadow-xl"
        onPress={() => handlePress(item)}
      >
        <Image
          source={{ uri: `${item.image}?random=${item.id}` }}
          resizeMode="contain"
          className="w-full h-40 rounded-lg"
        />
        <Text className="mt-2 text-lg font-bold" numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text className="text-gray-600">{item.price}</Text>
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

export default MainScreen;
