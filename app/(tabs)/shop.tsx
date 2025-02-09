// app/(tabs)/shop.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  ActivityIndicator,
} from "react-native";

import StatusCard from "../../components/section2/dashboardTextInfoStyle1";
import HorizontalScrollView from "../../components/section2/horizontalScrollView";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { getSingleServiceProviderData } from "../../Utility/U_getFirebaseData";

import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import RenderHTML from "react-native-render-html";

type Item = {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  items: any[];
};

const Shop = () => {
  const imageUrl = "https://cdn.pixabay.com/photo/2016/03/02/20/13/grocery-1232944_1280.jpg";
  const [data, setData] = useState<any>(null); // Use state to store fetched data

  const hasFetchedData = useRef(false); // Flag to track if data has been fetched ( ⚠️ Development only ⚠️)

  // Fetch data when the component mounts
  useEffect(() => {
    if (hasFetchedData.current) {
      // Data already fetched; don't run the effect again.
      console.log("🟡 Data already fetched 🟡");
      return;
    }
    hasFetchedData.current = true;

    const fetchData = async () => {
      const fetchedData = await getSingleServiceProviderData();
      setData(fetchedData);
      // console.log("Fetched data:", fetchedData);
    };

    fetchData();
  }, []);

  if (!data)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007bff" />
        <Text className="mt-4 text-lg font-semibold text-gray-600">Loading, please wait...</Text>
      </View>
    );

  // Safely access data.ItemList
  const itemList = data.ItemList ? Object.values(data.ItemList) : [];

  return (
    <ScrollView>
      <View className="flex-col bg-white">
        <View className=" flex-row items-center py-2 bg-primary">
          <View className="w-10" />
          <Text className="text-2xl font-bold flex-1 text-center">Explore Services</Text>
          <View className="px-3">
            <FontAwesome name="user-circle" size={24} color="black" />
          </View>
        </View>

        <View className="relative w-full h-[200px] items-center justify-center">
          <ImageBackground
            source={{
              uri: imageUrl,
            }}
            blurRadius={15}
            className="absolute w-full h-full"
          >
            <View className="flex-1" />
          </ImageBackground>
          <Image
            source={{
              uri: imageUrl,
            }}
            resizeMode="center"
            className="h-full w-full"
          />
        </View>

        <View className="h-auto px-4 py-2 bg-white shadow-xl">
          <Text className="text-2xl text-start font-semibold align-middle flex-1">
            Lanka Super Market
          </Text>
          <Text className="text-md text-start font-normal align-center">
            Discover fresh produce, daily essentials, and friendly service.
          </Text>
        </View>

        <View className="h-auto mx-6 my-4 flex-row flex-wrap justify-evenly p-2 rounded-2xl bg-primary shadow-lg">
          <View className="w-full h-auto">
            <Text className="text-lg text-center font-semibold">Store Overview</Text>
          </View>
          <StatusCard status="Waiting" count={200} />
          <StatusCard status="Completed" count={300} />
          <StatusCard status="Items" count={200} />
          <StatusCard status="Agreements" count={300} />
          <StatusCard status="Avg Ratings" count={300} />
          <StatusCard status="Messages" count={300} />
        </View>

        <View className="h-96 px-4">
          <Text className="text-sm text-left align-middle px-3">
            {`Shop at Joe's Fresh Market! 🛒 \n🥦 Fresh produce \n🛍️ Daily essentials \n😊 Friendly service Located in the heart of the neighborhood, Joe's Fresh Market is your go-to spot for all your grocery needs!`}
          </Text>
        </View>
        <View className="h-56">
          <HorizontalScrollView items={itemList as Item[]} />
        </View>
        <View className="h-40">
          <Text className="text-3xl text-center align-middle flex-1">Buttons</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Shop;
