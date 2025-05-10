import React, { useCallback, useRef, useState } from "react";
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
  Alert,
  StyleSheet,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { getShopPageData } from "../../../utility/U_getUserShopPageData";
import StatusCard from "../../../components/ui/dashboardTextInfoStyle1";
import HorizontalScrollView from "../../../components/ui/horizontalScrollView";
import UserComments from "@/components/ui/userComment";
import FloatingButtonBar from "@/components/ui/FloatingButtonBar";

import { useShop } from "@/context/ShopContext";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import UpdateSheet, { UpdateSheetRef } from "../../../components/ui/slideUpFormPage";
import UserReviewStars from "@/components/ui/userReviewStars";
import ShopContactInfo from "@/components/ui/shopContactInfo";
import { fetchUserComments } from "../../../utility/U_getUserComments";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserStorageService } from "../../../storage/functions/userStorageService";
import { OwnerShopPageAsyncStorage } from "../../../storage/functions/ownerShopDataStorage";

// TypeScript interfaces
import { ShopPageData, UserComment, ShopServices } from "../../../interfaces/iShop";
import { ShopDataForCharRoomCreating } from "../../../interfaces/iChat";
import { UserData } from "../../../interfaces/UserData";
import { updateShopMainPage } from "@/utility/u_updateShopPage";
import { useTheme } from "@/context/ThemeContext";

const Shop = () => {
  const { colors, theme, setTheme } = useTheme();
  const sheetRef = useRef<UpdateSheetRef>(null);
  // Shared value to control the FloatingButtonBar's vertical position.
  const floatingBarY = useSharedValue(0);
  const floatingBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingBarY.value }],
  }));

  const router = useRouter();
  const navigation = useNavigation();

  const [ratingsList, setRatingsList] = useState<any[]>([]);
  const [lastDoc, setLastCommentDoc] = useState<any>(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [userCommentList, setUserCommentList] = useState<any[]>([]);
  const [shopData, setShopData] = useState<ShopPageData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemList, setItemList] = useState<ShopServices[]>([]);

  /**
   *
   * Get User Data from AsyncStorage
   *
   */

  /**
   * Trigger a specific function when the page is focused
   */
  useFocusEffect(
    useCallback(() => {
      const fetchDataOnFocus = async () => {
        setIsLoading(true);
        try {
          // get user data from AsyncStorage
          const savedUserData = (await UserStorageService.getUserData()) as UserData;
          if (!savedUserData) {
            console.log("No user data found. Redirecting to login page.");
            router.push("/(auth)/login");
            return;
          }
          setUserData(savedUserData);

          // check if user is service provider
          if (!savedUserData?.isServiceProvider) {
            router.push("/(tabs)/shop/shop_Create");
            return;
          }

          // get shop comments
          if (savedUserData.userId) {
            const { comments, lastDoc: newLastDoc } = await fetchUserComments({
              initialLoad: true,
              userId: savedUserData.userId,
            });

            setUserCommentList(comments);
            setLastCommentDoc(newLastDoc);

            const fetchedData = await getShopPageData(savedUserData.userId);
            if (fetchedData) {
              setShopData(fetchedData);
              setItemList(fetchedData.items ? Object.values(fetchedData.items) : []);
            } else {
              console.log("No shop data found for the user.");
              Alert.alert("Error", "No shop data found for the user.");
            }
          }
        } catch (error) {
          console.error("Error in fetching process:", error);
          Alert.alert("Error", "An error occurred while fetching data. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDataOnFocus();
    }, [])
  );

  // loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading, please wait...</Text>
      </View>
    );
  }

  if (!shopData) {
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Shop Data Not Found</Text>
    </View>;
    return;
  }

  /**
   *
   * Left Button Press Handler - (Edit Page)
   *
   */
  const handleLeftPress = () => {
    console.log("Left button triggered in MainScreen");
    sheetRef.current?.open();
  };

  const handleRightPress = async () => {
    try {
      // Navigate to the next screen
      router.push("/(tabs)/shop/sp_ShopEdit");
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
    shopPageImageUrl: string;
  }) => {
    if (!userData) {
      console.error("User data is not available.");
      Alert.alert("Error", "User data is not available.");
      return;
    }
    // Check if we need multiple document updates or just a partial update.
    if (
      data.title !== shopData.shopName ||
      data.description !== shopData.shopDescription ||
      data.shopPageImageUrl !== shopData.shopPageImageUrl
    ) {
      console.log("Received updated values:", data);
      updateShopMainPage(
        userData.userId,
        data.title,
        data.description,
        data.phoneNumber,
        data.category,
        data.shopPageImageUrl,
        true
      );
    } else {
      updateShopMainPage(
        userData.userId,
        data.title,
        data.description,
        data.phoneNumber,
        data.category,
        data.shopPageImageUrl,
        false
      );
    }

    // Update the shop data in the UI
    setShopData((prev) => {
      if (!prev) {
        console.error("Previous shop data is null.");
        Alert.alert("Error", "Previous shop data is null.");
        return null;
      }
      return {
        ...prev,
        shopName: data.title,
        shopDescription: data.description,
        phoneNumber: data.phoneNumber,
        shopCategory: data.category,
        shopPageImageUrl: data.shopPageImageUrl,
      };
    });
  };

  /**
   *
   * Handle scrolling to end of list
   *
   */
  const handleEndReached = async () => {
    console.log("End reached, loading more comments...");
    if (!loadingMoreComments && lastDoc && userData) {
      setLoadingMoreComments(true);
      try {
        const { comments, lastDoc: newLastDoc } = await fetchUserComments({
          userId: userData.userId,
          lastDoc,
        });
        setUserCommentList((prev) => [...prev, ...comments]);
        setLastCommentDoc(newLastDoc);
      } catch (error) {
        console.error("Error fetching more comments:", error);
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
        <View style={{ height: 70 }} />
      )}
    </View>
  );

  // Header content that will scroll along with the FlatList
  const ListHeader = () => (
    <View>
      <View style={[styles.headerColumn, { backgroundColor: colors.background }]}>
        <View style={styles.headerTopBar}>
          <View style={styles.headerButtonPlaceholder} />
          <Text style={[styles.headerTitle]}>Explore Services</Text>
          <View style={styles.userIconContainer}>
            {userData?.profileImageUrl ? (
              <Image source={{ uri: userData?.profileImageUrl }} style={styles.profileImage} />
            ) : (
              <FontAwesome name="user-circle" size={28} color="black" />
            )}
          </View>
        </View>

        <View style={styles.imageContainer}>
          <ImageBackground
            source={{ uri: shopData.shopPageImageUrl }}
            blurRadius={15}
            style={styles.backgroundImage}
          >
            <View style={styles.flex1} />
          </ImageBackground>
          <Image
            source={{ uri: shopData.shopPageImageUrl }}
            resizeMode="center"
            style={styles.foregroundImage}
          />
        </View>

        <View style={[styles.shopInfoContainer, { backgroundColor: colors.card_background }]}>
          <Text style={styles.shopName}>{shopData.shopName}</Text>
          <Text style={styles.shopDescription}>{shopData.shopDescription}</Text>
          <View style={styles.infoRow}>
            <UserReviewStars
              averageRating={shopData.dashboardInfo.avgRatings}
              totalRatings={shopData.dashboardInfo.totalRatings}
            />
            <Text style={styles.locationBadge}>{shopData.shopLocation}</Text>
            <Text style={styles.categoryBadge}>{shopData.shopCategory}</Text>
          </View>
        </View>

        <View style={[styles.serviceInfoContainer, { backgroundColor: colors.card_background }]}>
          <Text style={styles.serviceInfoText}>{shopData.serviceInfo.replace(/\\n/g, "\n")}</Text>
        </View>

        <View style={[styles.itemsContainer, { backgroundColor: colors.background }]}>
          <HorizontalScrollView items={itemList as ShopServices[]} />
        </View>
        <View style={[styles.commentsHeaderContainer]}>
          <Text style={styles.commentsHeaderText}>Comments ({userCommentList.length})</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
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

      {/* Pass the onOpen and onClose callbacks to UpdateSheet */}
      <UpdateSheet
        ref={sheetRef}
        title={shopData.shopName}
        description={shopData.shopDescription}
        phoneNumber={shopData.phoneNumber}
        category={shopData.shopCategory}
        shopPageImageUrl={shopData.shopPageImageUrl}
        shopLocation={shopData.shopLocation}
        shopServiceInfo={shopData.serviceInfo}
        onUpdate={handleUpdate}
        onOpen={() => {
          // Slide the FloatingButtonBar down (off-screen).
          // Adjust the value (e.g., 60) to match your bar's height.
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red", // primary color
  },
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
    color: "#666666",
  },
  flex1: {
    flex: 1,
  },
  headerColumn: {
    flexDirection: "column",
  },
  headerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  headerButtonPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  userIconContainer: {
    paddingHorizontal: 12,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  foregroundImage: {
    height: "100%",
    width: "100%",
  },
  shopInfoContainer: {
    height: "auto",
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  shopName: {
    fontSize: 24,
    textAlign: "left",
    fontWeight: "600",
    flex: 1,
  },
  shopDescription: {
    fontSize: 16,
    textAlign: "left",
    fontWeight: "normal",
  },
  infoRow: {
    flexDirection: "row",
  },
  locationBadge: {
    backgroundColor: "#F7F7F7", // primary color
    borderRadius: 8,
    marginLeft: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 14,
    color: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  categoryBadge: {
    backgroundColor: "#F7F7F7", // primary color
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 14,
    color: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  serviceInfoContainer: {
    height: "auto",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  serviceInfoText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "left",
    paddingHorizontal: 12,
  },
  itemsContainer: {
    height: "auto",
    paddingVertical: 12,
  },
  commentsHeaderContainer: {},
  commentsHeaderText: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
  },
});

export default Shop;
