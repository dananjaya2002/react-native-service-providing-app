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
  Share,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from "react-native-reanimated";

import { getShopPageData } from "../../utility/U_getUserShopPageData";
import { FontAwesome } from "@expo/vector-icons";
import StatusCard from "../../components/ui/dashboardTextInfoStyle1";
import HorizontalScrollView from "../../components/ui/horizontalScrollView";
import UserComments from "@/components/ui/userComment";
import ShopContactInfo from "../../components/ui/shopContactInfo";
import UserReviewStars from "../../components/ui/userReviewStars";

import { fetchUserComments } from "../../utility/U_getUserComments";
import { createNewChatRoom } from "../../utility/U_createNewChatRoom";
import { DocumentSnapshot, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

import { UserStorageService } from "../../storage/functions/userStorageService";

// TypeScript interfaces
import { ShopList, ShopPageData, UserComment } from "../../interfaces/iShop";
import { ShopDataForCharRoomCreating } from "../../interfaces/iChat";
import { UserData } from "../../interfaces/UserData";
import { generateShareMessage } from "@/utility/u_shareShop";
import { addShopToFavorites } from "@/utility/u_handleUserFavorites";
import { useTheme } from "../../context/ThemeContext";

const CustomerShopView = () => {
  const { colors, theme, setTheme } = useTheme();
  // Retrieve the dynamic parameter "serviceProviderID" from the URL
  const { sp_ShopID } = useLocalSearchParams<{ sp_ShopID: string }>();
  const serviceProviderID = sp_ShopID;

  const [shopData, setShopData] = useState<ShopPageData | null>(null);

  const [userCommentList, setUserCommentList] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [shopListType, setShopListType] = useState<ShopList | null>(null);
  const [isBookmark, setIsBookmark] = useState(false);

  const hasFetchedData_DEV_MOD = useRef(false); // DEVELOPMENT ONLY

  useEffect(() => {
    async function fetchUserData() {
      try {
        const savedUserData = (await UserStorageService.getUserData()) as UserData;
        setUserData(savedUserData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUserData();
  }, []);

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

          // Create a ShopList type object
          const shopListObject: ShopList = {
            id: serviceProviderID,
            shopName: fetchedData.shopName,
            shopDescription: fetchedData.shopDescription,
            shopPageImageUrl: fetchedData.shopPageImageUrl,
            shopCategory: fetchedData.shopCategory,
            shopLocation: fetchedData.shopLocation,
            shopPageRef: serviceProviderID,
            userDocId: serviceProviderID,
            avgRating: fetchedData.avgRating,
            rating: fetchedData.avgRating,
            totalRatingsCount: fetchedData.totalRatingsCount,
          };
          setShopListType(shopListObject);

          // Check if the shop is already bookmarked
          const userFavorites = (await UserStorageService.getUserFavorites()) || [];
          const isBookmarked = userFavorites.some((favorite) => favorite.id === shopListObject.id);
          setIsBookmark(isBookmarked); // Update the state based on the result
        }
      } catch (error) {
        console.error("Error fetching shopData:", error);
      }
    };
    fetchData();
  }, []);

  // Loading placeholder
  if (!shopData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading, please wait...</Text>
      </View>
    );
  }

  const itemList = shopData.items ? Object.values(shopData.items) : [];

  const AnimatedPlaceholder = () => {
    return (
      <View className="h-[50] w-screen justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  // Handle scrolling to end of list
  const handleEndReached = async () => {
    if (!loadingMoreComments && lastDoc) {
      console.log("loading more comments...");
      setLoadingMoreComments(true);
      try {
        console.log("loading more comments...");
        const { comments, lastDoc: newLastDoc } = await fetchUserComments({
          userId: serviceProviderID,
          lastDoc, // ensure you're passing the lastDoc for pagination
        });
        setUserCommentList((prev) => [...prev, ...comments]);
        setLastDoc(newLastDoc);
      } catch (error) {
        console.error("Error loading more comments:", error);
        //alert("Failed to load more comments. Please try again later.");
      } finally {
        setLoadingMoreComments(false);
      }
    }
  };

  // Handle contact option selection
  const handleContactOptionSelect = async (option: string) => {
    console.log("Selected option:", option);

    const shopDataForChatRoom: ShopDataForCharRoomCreating = {
      serviceProviderUserID: serviceProviderID,
      shopName: shopData.shopName,
      shopProfileImageUrl: shopData.shopPageImageUrl,
    };

    if (option === "Chat") {
      if (userData?.userId == serviceProviderID) {
        Alert.alert("You cannot chat with yourself.");
        return;
      }
      const chatRoomId = await createNewChatRoom(shopDataForChatRoom);
      router.push({
        pathname: "/(tabs)/chat/chatWindow/chatUi",
        params: {
          userID: userData?.userId,
          chatRoomDocRefId: chatRoomId,
          userRole: "customer",
          otherPartyUserId: serviceProviderID,
        },
      });
    } else if (option === "Save") {
      // if (!shopListType) {
      //   console.error("Shop list type is null. Cannot add to favorites.");
      //   return;
      // }
      // const success = await addShopToFavorites(shopListType);
      // if (success) {
      //   console.log("Shop added to favorites or already exists.");
      // } else {
      //   console.log("Failed to add shop to favorites.");
      // }
    } else if (option === "Share") {
      const message = generateShareMessage(shopData);
      Share.share({
        message,
      })
        .then((res) => console.log("Share success:", res))
        .catch((err) => console.error("Share error:", err));
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
        <View style={styles.animatedPlaceholder}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View style={{ height: 20 }} />
      )}
    </View>
  );

  // Header content that will scroll along with the FlatList
  const ListHeader = () => (
    <View>
      {/* Header Section */}
      <View style={[styles.headerWrapper, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeftSpacer} />
          <Text style={styles.headerTitle}>Explore Services</Text>
          <View style={styles.headerIconWrapper}>
            {userData?.profileImageUrl ? (
              <Image
                source={{ uri: userData.profileImageUrl }}
                style={{ width: 34, height: 34, borderRadius: 18 }}
                onError={() => console.error("Failed to load user profile image")}
              />
            ) : (
              <FontAwesome name="user-circle" size={34} color="black" />
            )}
          </View>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={{ uri: shopData.shopPageImageUrl }}
            blurRadius={15}
            style={styles.bannerBackground}
          >
            <View style={styles.bannerOverlay} />
          </ImageBackground>
          <Image source={{ uri: shopData.shopPageImageUrl }} style={styles.bannerImage} />
        </View>

        {/* Shop Info */}
        <View style={[styles.shopInfoContainer, { backgroundColor: colors.card_background }]}>
          <Text style={styles.shopName}>{shopData.shopName}</Text>
          <Text style={styles.shopDescription}>{shopData.shopDescription}</Text>
          <UserReviewStars
            averageRating={shopData.avgRating}
            totalRatings={shopData.dashboardInfo.totalRatings}
          />
        </View>

        {/* Contact Buttons */}
        <View style={[styles.contactContainerWrapper, { backgroundColor: colors.card_background }]}>
          <View style={[styles.contactContainer, {}]}>
            <ShopContactInfo onOptionSelect={handleContactOptionSelect} shop={shopListType!} />
          </View>
        </View>

        {/* Service Info */}
        <View style={[styles.serviceInfoContainer, { backgroundColor: colors.card_background }]}>
          <Text style={styles.serviceInfoText}>{shopData.serviceInfo.replace(/\\n/g, "\n")}</Text>
        </View>

        {/* Items Carousel */}
        <View style={[styles.itemsContainer]}>
          <HorizontalScrollView items={itemList} />
        </View>

        {/* Comments Header */}
        <View style={styles.commentsHeaderContainer}>
          <Text style={styles.commentsHeaderText}>Comments</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={userCommentList}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          const comment = item as UserComment;
          return (
            <UserComments
              id={comment.id}
              profileImageUrl={comment.profileImageUrl}
              name={comment.name}
              uploadedDate={comment.uploadedDate}
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
  );
};

const styles = StyleSheet.create({
  // Root
  container: {
    flex: 1,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
  },
  // Animated placeholder
  animatedPlaceholder: {
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  // Header wrapper
  headerWrapper: {
    //empty
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  headerLeftSpacer: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  headerIconWrapper: {
    paddingHorizontal: 12,
  },
  // Banner
  bannerContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    flex: 1,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "center",
  },
  // Shop Info
  shopInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1,
  },
  shopName: {
    fontSize: 24,
    fontWeight: "600",
  },
  shopDescription: {
    fontSize: 16,
    fontWeight: "400",
    marginTop: 4,
  },
  // Contact
  contactContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 0,
  },
  contactContainerWrapper: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  // Service Info
  serviceInfoContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#6B7280",
  },
  serviceInfoText: {
    fontSize: 14,
    textAlign: "left",
    paddingHorizontal: 12,
  },
  // Items carousel
  itemsContainer: {
    paddingVertical: 0,
    marginBottom: 18,
  },
  // Comments header
  commentsHeaderContainer: {
    marginBottom: 8,
  },
  commentsHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 16,
  },
});

export default CustomerShopView;
