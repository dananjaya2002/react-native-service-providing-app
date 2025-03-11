import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ImageBackground,
  Image,
  FlatList,
  Linking,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
import ShopContactInfo from "../../components/section2/shopContactInfo";
import UserReviewStars from "../../components/section2/userReviewStars";

import { fetchUserComments } from "../../Utility/U_getUserComments";
import { DocumentSnapshot, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

interface UserComment {
  profileImageUrl: string;
  Name: string;
  Timestamp: Timestamp;
  Ratings: number;
  Comment: string;
  customerId: string;
}

interface ShopServices {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}
interface ShopDashboardInfo {
  agreement: string;
  avgRatings: number;
  completed: number;
  items: number;
  messages: number;
  totalComments: number;
  totalRatings: number;
  waiting: number;
}

interface gpsCoordinates {
  latitude: number;
  longitude: number;
}
interface ShopPageData {
  avgRating: number;
  dashboardInfo: ShopDashboardInfo;
  gpsCoordinates: gpsCoordinates;
  items: ShopServices[];
  phoneNumber: string;
  serviceInfo: string;
  shopCategory: string;
  shopDescription: string;
  shopLocation: string;
  shopName: string;
  shopPageImageUrl: string;
  totalRingsCount: number;
}

const CustomerShopView = () => {
  // Retrieve the dynamic parameter "serviceProviderID" from the URL
  const { sp_ShopID } = useLocalSearchParams<{ sp_ShopID: string }>();
  const serviceProviderID = sp_ShopID;

  const [shopData, setShopData] = useState<ShopPageData | null>(null);

  const [userCommentList, setUserCommentList] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  const hasFetchedData_DEV_MOD = useRef(false); // DEVELOPMENT ONLY

  /**
   * Getting Data from Firebase
   */
  useEffect(() => {
    if (hasFetchedData_DEV_MOD.current) {
      console.log("⛔ Data Fetching Prevented ⛔");
      return;
    }

    const fetchData = async () => {
      try {
        hasFetchedData_DEV_MOD.current = true; // DEVELOPMENT ONLY
        // Attempt to fetch user comment shopData
        const { comments, lastDoc: newLastDoc } = await fetchUserComments({
          initialLoad: true,
          userId: serviceProviderID,
        });
        setUserCommentList(comments);
        setLastDoc(newLastDoc);

        // Attempt to fetch shopData shopData
        const fetchedData = await getShopPageData(serviceProviderID);
        if (fetchedData) {
          setShopData(fetchedData);
        } else {
          // Use fallback JSON if live shopData isn't available
          const jsonData = require("../DevSection/utilities/shopDoc.json");
          setShopData(jsonData);
          console.warn(" ⚠️ ⚠️ Shop shopData not found. Using fallback JSON shopData.⚠️ ⚠️");
        }
      } catch (error) {
        console.error("Error fetching shopData:", error);
        const jsonData = require("../DevSection/utilities/shopDoc.json"); // Fallback JSON
        setShopData(jsonData);
      }
    };
    fetchData();
  }, []);

  if (!shopData) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007bff" />
        <Text className="mt-4 text-lg font-semibold text-gray-600">Loading, please wait...</Text>
      </View>
    );
  }

  const itemList = shopData.items ? Object.values(shopData.items) : [];
  //const userCommentList = shopData.comments ? Object.values(shopData.comments) : [];

  /*
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
        const { comments, lastDoc: newLastDoc } = await fetchUserComments({
          userId: serviceProviderID,
          lastDoc, // ensure you're passing the lastDoc for pagination
        });
        setUserCommentList((prev) => [...prev, ...comments]);
        setLastDoc(newLastDoc);
      } catch (error) {
        console.error("Error loading more comments:", error);
        alert("Failed to load more comments. Please try again later.");
      } finally {
        setLoadingMoreComments(false);
      }
    }
  };

  const handleContactOptionSelect = (option: string) => {
    console.log("Selected option:", option);

    if (option === "Chat") {
    } else if (option === "Map") {
    } else if (option === "Share") {
    } else if (option === "Call") {
      const phoneUrl = `tel:${shopData.phoneNumber}`;
      Linking.openURL(phoneUrl).catch((err) => {
        console.error("Failed to open dialer:", err);
        Alert.alert("Failed to open dialer. Please try again later.");
      });
    } else {
      console.warn("☢️ Unhandled contact option:", option);
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
          <UserReviewStars
            averageRating={shopData.avgRating}
            totalRatings={shopData.dashboardInfo.totalRatings}
          />
        </View>

        <View className="flex-row justify-center items-center mx-8 my-3">
          <ShopContactInfo onOptionSelect={handleContactOptionSelect} />
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
    <View className="flex-1 bg-primary">
      <FlatList
        data={userCommentList}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          const comment = item as UserComment;
          return (
            <UserComments
              profileImage={comment.profileImageUrl}
              customerName={comment.Name}
              date={comment.Timestamp.toDate()}
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
