import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, View, StyleSheet, Pressable, Image, Text } from "react-native";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../FirebaseConfig"; // Import Firebase db instance

type Item = {
  id: string;
  name: string;
  price: string;
  image: string;
};

const { width } = Dimensions.get("window");
const itemWidth = (width / 3) * 2;
const gap = (width - itemWidth) / 4;

const TileScrolling = () => {
  const [items, setItems] = useState<Item[]>([]);
  const fetchedRef = useRef(false); // Prevent duplicate fetching ( *** for Development only *** )

  // Fetch data from Firestore
  const fetchData = async () => {
    if (fetchedRef.current || !db) {
      console.warn("❌ Firestore is not initialized.");
      return;
    }
    fetchedRef.current = true; // Update the ref to prevent duplicate fetching ( *** for Development only *** )
    try {
      console.warn(" Firestore is initialized.");
      const querySnapshot = await getDocs(collection(db, "Service"));
      const itemsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().Title || "Unknown", // Provide fallback values
        price: "Unknown",
        image: doc.data().ImageURL || "", // Fallback for image
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

  const handlePress = (item: Item) => {
    console.log("Item pressed:", item);
  };

  return (
    <ScrollView
      horizontal
      pagingEnabled
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth + gap}
      className="  ml-4"
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => handlePress(item)}
          className="w-80 mr-2 rounded-2xl overflow-hidden bg-white border border-neutral-300 shadow-xl"
        >
          <View className="h-64">
            <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="contain" />
          </View>

          <View className="h-auto w-full bg-slate-50 items-center justify-center flex-1">
            <Text className="text-black font-bold text-sm " numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="text-black text-base font-bold">{item.price}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
};
export default TileScrolling;
