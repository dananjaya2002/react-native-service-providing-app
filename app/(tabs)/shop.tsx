// app/(tabs)/shop.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image } from "react-native";

import StatusCard from "../../components/section2/dashboardTextInfoStyle1";
import HorizontalScrollView from "../..//components/section2/horizontalScrollView";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const Shop = () => {
  const imageUrl = "https://cdn.pixabay.com/photo/2016/03/02/20/13/grocery-1232944_1280.jpg";
  return (
    <ScrollView>
      <View className="flex-col bg-slate-400">
        <View className=" flex-row items-center py-2">
          <View className="w-10" />
          <Text className="text-2xl font-bold flex-1 text-center">Explore Services</Text>
          <View className="px-3">
            <FontAwesome name="user-circle" size={24} color="black" />
          </View>
        </View>

        <View className="relative w-full h-[200px] bg-neutral-400 items-center justify-center">
          <ImageBackground
            source={{
              uri: imageUrl,
            }}
            blurRadius={15}
            className="absolute w-full h-full"
          >
            <View className="flex-1 bg-[rgba(0,0,0,0.2)]" />
          </ImageBackground>
          <Image
            source={{
              uri: imageUrl,
            }}
            resizeMode="center"
            className="h-full w-full"
          />
        </View>

        <View className="h-16 bg-neutral-300">
          <Text className="text-2xl text-center font-semibold align-middle flex-1">
            Lanka Super Market
          </Text>
        </View>

        <View className="h-auto bg-white mx-6 my-4 flex-row flex-wrap justify-evenly p-2 rounded-2xl">
          <View className="w-full h-auto">
            <Text className="text-lg text-center font-semibold">Info</Text>
          </View>
          <StatusCard status="Waiting" count={200} />
          <StatusCard status="Completed" count={300} />
          <StatusCard status="Items" count={200} />
          <StatusCard status="Agreements" count={300} />
          <StatusCard status="Avg Ratings" count={300} />
          <StatusCard status="Messages" count={300} />
        </View>

        <View className="h-96 bg-white">
          <Text className="text-3xl text-center align-middle">Description</Text>
          <HorizontalScrollView />
        </View>
        <View className="h-56 bg-neutral-200">
          <Text className="text-3xl text-center align-middle flex-1">Items</Text>
        </View>
        <View className="h-40 bg-neutral-300">
          <Text className="text-3xl text-center align-middle flex-1">Buttons</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Shop;
