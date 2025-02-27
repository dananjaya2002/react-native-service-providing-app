import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { getShopPageData } from "../../Utility/U_getFirebaseData";
import StatusCard from "../../components/section2/dashboardTextInfoStyle1";
import HorizontalScrollView from "../../components/section2/horizontalScrollView";
import UserComments from "@/components/section2/userComment";
import FloatingButtonBar from "@/components/section2/FloatingButtonBar";

import { useShop } from "../../context/ShopContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import UpdateSheet, { UpdateSheetRef } from "../../components/section2/slideUpFormPage";
import UserReviewStars from "@/components/section2/userReviewStars";
import ShopContactInfo, { Props } from "@/components/section2/shopContactInfo";
import { fetchRatings } from "@/Utility/U_getUserComments";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const Shop = () => {
  const sheetRef = useRef<UpdateSheetRef>(null);
  // Shared value to control the FloatingButtonBar's vertical position.
  const floatingBarY = useSharedValue(0);
  const floatingBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingBarY.value }],
  }));

  const { shop, setShop } = useShop();
  const router = useRouter();

  // Retrieve the dynamic parameter "sp_ShopID" from the URL
  const { sp_ShopID } = useLocalSearchParams<{ sp_ShopID: string }>();
  const shopID = sp_ShopID ?? "1"; // !!! -- for Development only -- !!!
  //console.log("sp_ShopID", sp_ShopID);

  const [data, setData] = useState<any>(null);

  const [ratingsList, setRatingsList] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

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
   *
   */
  const handleLeftPress = () => {
    console.log("Left button triggered in MainScreen");
    sheetRef.current?.open();
  };

  const handleRightPress = async () => {
    //setShop(itemList as SubServiceData[]);
    try {
      // Store the data in AsyncStorage
      await AsyncStorage.setItem("shop_data", JSON.stringify(data));
      console.log("Right button triggered in MainScreen");
      // Navigate to the next screen
      router.push("/serviceProvider/sp_ShopEdit");
    } catch (error) {
      console.error("Error storing data:", error);
    }
  };

  // Receive updated data from UpdateSheet.
  const handleUpdate = (data: {
    title: string;
    description: string;
    phoneNumber: string;
    category: string;
  }) => {
    console.log("Received updated values:", data);
    // Handle the updated data (e.g., update state or call an API)
  };

  /**
   *
   *
   */

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
        <View style={{ height: 70, backgroundColor: "green" }} />
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
          <View className="flex-row">
            <UserReviewStars
              averageRating={data.DashboardInfo.avgRatings}
              totalRatings={data.DashboardInfo.totalRatings}
            />
            <Text className="bg-primary rounded-2xl ml-6 px-4 border border-gray-300">Colombo</Text>
          </View>
        </View>

        <View className="h-auto mx-6 my-4 flex-row flex-wrap justify-evenly p-2 rounded-2xl bg-primary">
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
    <>
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

      {/* Pass the onOpen and onClose callbacks to UpdateSheet */}
      <UpdateSheet
        ref={sheetRef}
        title={data.ShopName}
        description={data.ShopDescription}
        phoneNumber={data.PhoneNumber}
        category={data.Category}
        onUpdate={handleUpdate}
        onOpen={() => {
          // Slide the FloatingButtonBar down (off-screen).
          // Adjust the value (e.g., 60) to match your bar’s height.
          floatingBarY.value = withTiming(80, { duration: 300 });
        }}
        onClose={() => {
          // Slide the FloatingButtonBar back up.
          floatingBarY.value = withTiming(0, { duration: 300 });
        }}
      />

      {/* Wrap the FloatingButtonBar in an Animated.View */}
      <Animated.View
        style={[
          floatingBarAnimatedStyle,
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
          },
        ]}
      >
        <FloatingButtonBar
          leftButtonName="Edit Page"
          rightButtonName="Edit Items"
          onLeftPress={handleLeftPress}
          onRightPress={handleRightPress}
        />
      </Animated.View>
    </>
  );
};

export default Shop;
