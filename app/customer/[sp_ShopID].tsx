import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, ImageBackground, Image, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from "react-native-reanimated";

import { getShopPageData } from "../../Utility/U_getFirebaseData";
import { FontAwesome } from "@expo/vector-icons";
import StatusCard from "../../components/section2/dashboardTextInfoStyle1";
import HorizontalScrollView from "../../components/section2/horizontalScrollView";
import UserComments from "@/components/section2/userComment";
import ShopContactInfo, { Props } from "../../components/section2/shopContactInfo";
import UserReviewStars from "../../components/section2/userReviewStars";

import { fetchRatings } from "../../Utility/U_getUserComments";

type SubServiceData = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
};

interface UserComment {
  profileImageUrl: string;
  Name: string;
  Date: Date;
  Ratings: number;
  Comment: string;
}
interface ShopRatingsView {
  totalRatings: number;
  averageRating: number;
}

const CustomerShopView = () => {
  // Retrieve the dynamic parameter "sp_ShopID" from the URL
  const { sp_ShopID } = useLocalSearchParams<{ sp_ShopID: string }>();
  const shopID = sp_ShopID ?? "1"; // !!! -- for Development only -- !!!
  //console.log("sp_ShopID", sp_ShopID);

  const [data, setData] = useState<any>(null);

  const [ratingsList, setRatingsList] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  /**
   * Getting Data from Firebase
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Attempt to fetch shopData data
        const fetchedData = await getShopPageData();

        // Attempt to fetch user comment data
        const { ratings, lastDoc: newLastDoc } = await fetchRatings({ initialLoad: true });
        setRatingsList(ratings);
        setLastDoc(newLastDoc);
        //console.log("fetchedData", fetchedData);
        if (fetchedData) {
          setData(fetchedData);
        } else {
          // Use fallback JSON if live data isn't available
          const jsonData = require("../DevSection/utilities/shopDoc.json");
          setData(jsonData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        const jsonData = require("../DevSection/utilities/shopDoc.json"); // Fallback JSON
        setData(jsonData);
      }
    };
    fetchData();
    console.log("\n\nFetching data for Shop ID:", shopID);
  }, []);

  if (!data) {
    // // Note: setting state during render is not ideal, but keeping original logic
    // const jsonData = require("../DevSection/utilities/shopDoc.json");
    // setData(jsonData);
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007bff" />
        <Text className="mt-4 text-lg font-semibold text-gray-600">Loading, please wait...</Text>
      </View>
    );
  }

  const itemList = data.ItemList ? Object.values(data.ItemList) : [];
  const userCommentList = data.ratings ? Object.values(data.ratings) : [];

  const contactOptions: Props[] = [
    { text: "Call", iconName: "call" },
    { text: "Chat", iconName: "chatbubbles" },
    { text: "Map", iconName: "map" },
    { text: "Share", iconName: "share" },
  ];

  /**
   *
   * New Comment Loading placeholder logic
   *
   */

  // A simple animated placeholder component using Reanimated
  const AnimatedPlaceholder = () => {
    return (
      <View className="h-[50] w-screen justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  // Handle scrolling to end of list
  const handleEndReached = async () => {
    console.log("End reached, loading more comments...");
    if (!loadingMoreComments && lastDoc) {
      setLoadingMoreComments(true);
      try {
        const { ratings, lastDoc: newLastDoc } = await fetchRatings({ lastDoc });
        setRatingsList((prev) => [...prev, ...ratings]);
        setLastDoc(newLastDoc);
      } catch (error) {
        // Handle error as needed
      } finally {
        setLoadingMoreComments(false);
      }
    }
  };

  // Footer component showing an ActivityIndicator when loading more comments
  const ListFooter = () => (
    <View>
      {loadingMoreComments ? (
        <View style={{ height: 50, width: "100%", justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View style={{ height: 20, backgroundColor: "green" }} />
      )}
    </View>
  );

  // Header content that will scroll along with the FlatList
  const ListHeader = () => (
    <View>
      <View className="flex-col bg-white">
        <View className="flex-row items-center py-2 bg-primary">
          <View className="w-10" />
          <Text className="text-2xl font-bold flex-1 text-center">Explore Services</Text>
          <View className="px-3">
            <FontAwesome name="user-circle" size={24} color="black" />
          </View>
        </View>

        <View className="relative w-full h-[200px] items-center justify-center">
          <ImageBackground
            source={{ uri: data.shopPageImageUrl }}
            blurRadius={15}
            className="absolute w-full h-full"
          >
            <View className="flex-1" />
          </ImageBackground>
          <Image
            source={{ uri: data.shopPageImageUrl }}
            resizeMode="center"
            className="h-full w-full"
          />
        </View>

        <View className="h-auto px-4 py-2 bg-white shadow-xl">
          <Text className="text-2xl text-start font-semibold flex-1">{data.shopTitle}</Text>
          <Text className="text-md text-start font-normal">{data.shopDescription}</Text>
          <UserReviewStars
            averageRating={data.DashboardInfo.avgRatings}
            totalRatings={data.DashboardInfo.totalRatings}
          />
        </View>

        <View className="flex-row justify-center items-center mx-8 my-3">
          {contactOptions.map((option, index) => (
            <ShopContactInfo key={index} props={option} />
          ))}
        </View>

        <View className="h-auto py-2 px-3 mb-6 border-[1px] border-y-gray-500 ">
          <Text className="text-sm text-left px-3">{data.serviceInfo.replace(/\\n/g, "\n")}</Text>
        </View>

        <View className="h-auto bg-primary py-3">
          <HorizontalScrollView items={itemList as SubServiceData[]} />
        </View>
        <View className="bg-primary">
          <Text className="text-lg font-semibold mx-4">Comments</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-primary">
      <FlatList
        data={ratingsList}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          const comment = item as UserComment;
          return (
            <UserComments
              profileImage={comment.profileImageUrl}
              customerName={comment.Name}
              date={comment.Date}
              rating={comment.Ratings}
              comment={comment.Comment}
            />
          );
        }}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default CustomerShopView;
