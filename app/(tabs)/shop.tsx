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
import UserComments from "@/components/section2/userComment";
import FloatingButtonBar from "@/components/section2/FloatingButtonBar";

type Item = {
  description: string;
  title: string;
  imageUrl: string;
  items: Item[];
};

interface UserComment {
  profileUrl: string;
  name: string;
  date: string;
  ratings: number;
  comment: string;
}

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

  // Safely access data.ItemList and data.CommentOverview
  const itemList = data.ItemList ? Object.values(data.ItemList) : [];
  const userCommentList = data.CommentOverview ? Object.values(data.CommentOverview) : [];

  const handleLeftPress = () => {
    // Functionality for the left button
    console.log("Left button triggered in MainScreen");
    // For example: navigate to a specific page or perform an action
  };

  const handleRightPress = () => {
    // Functionality for the right button
    console.log("Right button triggered in MainScreen");
    // For example: open a modal or trigger an API call
  };

  return (
    <>
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
                uri: data.ShopPageImageUrl,
              }}
              blurRadius={15}
              className="absolute w-full h-full"
            >
              <View className="flex-1" />
            </ImageBackground>
            <Image
              source={{
                uri: data.ShopPageImageUrl,
              }}
              resizeMode="center"
              className="h-full w-full"
            />
          </View>

          <View className="h-auto px-4 py-2 bg-white shadow-xl">
            <Text className="text-2xl text-start font-semibold align-middle flex-1">
              {data.ShopName}
            </Text>
            <Text className="text-md text-start font-normal align-center">
              {data.ShopDescription}
            </Text>
          </View>

          <View className="h-auto mx-6 my-4 flex-row flex-wrap justify-evenly p-2 rounded-2xl bg-primary shadow-lg">
            <View className="w-full h-auto">
              <Text className="text-lg text-center font-semibold">Store Overview</Text>
            </View>
            <StatusCard status="Waiting" count={data.DashboardInfo.waitings} />
            <StatusCard status="Completed" count={data.DashboardInfo.completed} />
            <StatusCard status="Items" count={data.DashboardInfo.items} />
            <StatusCard status="Agreements" count={data.DashboardInfo.agreements} />
            <StatusCard status="Avg Ratings" count={data.DashboardInfo.avgRatings} />
            <StatusCard status="Messages" count={data.DashboardInfo.messages} />
          </View>

          <View className="h-auto px-4 my-5">
            <Text className="text-sm text-left align-middle px-3">
              {data.ShopServiceInfo.replace(/\\n/g, "\n")}
            </Text>
          </View>
          <View className="h-auto bg-primary py-3">
            <HorizontalScrollView items={itemList as Item[]} />
          </View>
          <View className="flex-1 justify-center bg-primary ">
            <Text className="font-semibold mx-4 my-2 text-lg">Comments</Text>
            {userCommentList.map((userComment, index) => {
              const comment = userComment as UserComment;
              return (
                <UserComments
                  key={index}
                  profileImage={comment.profileUrl}
                  customerName={comment.name}
                  date={comment.date}
                  rating={comment.ratings}
                  comment={comment.comment}
                />
              );
            })}
          </View>
        </View>
        <View className="h-20 bg-primary" />
      </ScrollView>
      <FloatingButtonBar
        leftButtonName="Edit Page"
        rightButtonName="Edit Items"
        onLeftPress={handleLeftPress}
        onRightPress={handleRightPress}
      />
    </>
  );
};

export default Shop;
