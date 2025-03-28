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
import { getShopPageData } from "../../Utility/U_getUserShopPageData";
import StatusCard from "../../components/section2/dashboardTextInfoStyle1";
import HorizontalScrollView from "../../components/section2/horizontalScrollView";
import UserComments from "@/components/section2/userComment";
import FloatingButtonBar from "@/components/section2/FloatingButtonBar";

import { useShop } from "../../context/ShopContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import UpdateSheet, { UpdateSheetRef } from "../../components/section2/slideUpFormPage";
import UserReviewStars from "@/components/section2/userReviewStars";
import ShopContactInfo from "@/components/section2/shopContactInfo";
import { fetchUserComments } from "../../Utility/U_getUserComments";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserStorageService } from "../../storage/functions/userStorageService";
import { OwnerShopPageAsyncStorage } from "../../storage/functions/ownerShopDataStorage";

// TypeScript interfaces
import { ShopPageData, UserComment, ShopServices } from "../../interfaces/iShop";
import { ShopDataForCharRoomCreating } from "../../interfaces/iChat";
import { UserData } from "../../interfaces/UserData";

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

  const [ratingsList, setRatingsList] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [userCommentList, setUserCommentList] = useState<any[]>([]);
  const [shopData, setShopData] = useState<ShopPageData | null>(null);

  /**
   *
   * Get User Data from AsyncStorage
   *
   */
  const [userDocRefID, setUserDocRefID] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const savedUserData = (await UserStorageService.getUserData()) as UserData;
        setUserDocRefID(savedUserData.userId);
        console.log("User data fetched:", savedUserData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUserData();
  }, []);

  /**
   *
   * Get Data from the Database
   *
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userDocRefID) {
          //console.error("Invalid userDocRefID. Please check the user data.");
          return;
        }
        // Attempt to fetch shopData data
        const { comments, lastDoc: newLastDoc } = await fetchUserComments({
          initialLoad: true,
          userId: userDocRefID,
        });
        setUserCommentList(comments);
        setLastDoc(newLastDoc);

        // Attempt to fetch shopData shopData
        const fetchedData = await getShopPageData(userDocRefID);
        if (fetchedData) {
          setShopData(fetchedData);
          saveShopData(fetchedData); // Save the data in AsyncStorage
        } else {
          // Use fallback JSON if live shopData isn't available
          const jsonData = require("../DevSection/utilities/shopDoc.json");
          setShopData(jsonData);
          console.warn(" ⚠️ ⚠️ Shop shopData not found. Using fallback JSON shopData.⚠️ ⚠️");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        const jsonData = require("../DevSection/utilities/shopDoc.json"); // Fallback JSON
        setShopData(jsonData);
      }
    };
    fetchData();
    console.log("\n\nFetching data for Shop ID:", userDocRefID);
  }, [userDocRefID]);

  const saveShopData = async (shopData: ShopPageData) => {
    try {
      await OwnerShopPageAsyncStorage.saveUserData(shopData);
      console.log("Shop data saved successfully!");
    } catch (error) {
      console.error("Error saving shop data:", error);
    }
  };

  if (!shopData) {
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
  const itemList = shopData.items ? Object.values(shopData.items) : [];

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
      await AsyncStorage.setItem("shop_data", JSON.stringify(shopData));
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
    if (!loadingMoreComments && lastDoc && userDocRefID) {
      setLoadingMoreComments(true);
      try {
        const { comments, lastDoc: newLastDoc } = await fetchUserComments({
          userId: userDocRefID,
          lastDoc,
        });
        setRatingsList((prev) => [...prev, ...comments]);
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
            source={{ uri: shopData.shopPageImageUrl }}
            blurRadius={15}
            className="absolute w-full h-full"
          >
            <View className="flex-1" />
          </ImageBackground>
          <Image
            source={{ uri: shopData.shopPageImageUrl }}
            resizeMode="center"
            className="h-full w-full"
          />
        </View>

        <View className="h-auto px-4 py-2 bg-white shadow-xl">
          <Text className="text-2xl text-start font-semibold flex-1">{shopData.shopName}</Text>
          <Text className="text-md text-start font-normal">{shopData.shopDescription}</Text>
          <View className="flex-row">
            <UserReviewStars
              averageRating={shopData.dashboardInfo.avgRatings}
              totalRatings={shopData.dashboardInfo.totalRatings}
            />
            <Text className="bg-primary rounded-2xl ml-6 px-4 border border-gray-300">Colombo</Text>
          </View>
        </View>

        <View className="h-auto mx-6 my-4 flex-row flex-wrap justify-evenly p-2 rounded-2xl bg-primary">
          <View className="w-full h-auto">
            <Text className="text-lg text-center font-semibold">Store Overview</Text>
          </View>
          <StatusCard status="Waiting" count={shopData.dashboardInfo.waiting} />
          <StatusCard status="Completed" count={shopData.dashboardInfo.completed} />
          <StatusCard status="Items" count={shopData.dashboardInfo.items} />
          <StatusCard status="Agreements" count={shopData.dashboardInfo.agreement} />
          <StatusCard status="Avg Ratings" count={shopData.dashboardInfo.avgRatings} />
          <StatusCard status="Messages" count={shopData.dashboardInfo.messages} />
        </View>

        <View className="h-auto py-2 px-3 mb-6 border-[1px] border-y-gray-500 ">
          <Text className="text-sm text-left px-3">
            {shopData.serviceInfo.replace(/\\n/g, "\n")}
          </Text>
        </View>

        <View className="h-auto bg-primary py-3">
          <HorizontalScrollView items={itemList as ShopServices[]} />
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
                id={comment.id}
                profileImageUrl={comment.profileImageUrl}
                name={comment.name}
                timestamp={comment.timestamp}
                ratings={comment.ratings}
                comment={comment.comment}
                customerId={comment.customerId}
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
        title={shopData.shopName}
        description={shopData.shopDescription}
        phoneNumber={shopData.phoneNumber}
        category={shopData.shopCategory}
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
