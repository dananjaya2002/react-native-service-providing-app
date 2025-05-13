import React, { useEffect, useState } from "react";
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
import { FontAwesome } from "@expo/vector-icons";
import { QueryDocumentSnapshot } from "firebase/firestore";

import { getShopPageData } from "../../utility/U_getUserShopPageData";
import { fetchUserComments } from "../../utility/U_getUserComments";
import { createNewChatRoom } from "../../utility/U_createNewChatRoom";
import { UserStorageService } from "../../storage/functions/userStorageService";
import { generateShareMessage } from "@/utility/u_shareShop";
import { useTheme } from "../../context/ThemeContext";

import HorizontalScrollView from "../../components/ui/horizontalScrollView";
import UserComments from "@/components/ui/userComment";
import ShopContactInfo from "../../components/ui/shopContactInfo";
import UserReviewStars from "../../components/ui/userReviewStars";

// TypeScript interfaces
import { ShopList, ShopPageData, UserComment } from "../../interfaces/iShop";
import { ShopDataForCharRoomCreating } from "../../interfaces/iChat";
import { UserData } from "../../interfaces/UserData";

const CustomerShopView = () => {
  const { colors } = useTheme();

  // Retrieve the dynamic parameter from the URL
  const { sp_ShopID } = useLocalSearchParams<{ sp_ShopID: string }>();
  const serviceProviderID = sp_ShopID;

  // State
  const [shopData, setShopData] = useState<ShopPageData | null>(null);
  const [userCommentList, setUserCommentList] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [shopListType, setShopListType] = useState<ShopList | null>(null);
  const [isBookmark, setIsBookmark] = useState(false);

  // Load user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const savedUserData = (await UserStorageService.getUserData()) as UserData;
        setUserData(savedUserData);
      } catch (error) {
        Alert.alert("Error", "Failed to load user data");
      }
    }
    fetchUserData();
  }, []);

  // Load shop data and comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch comments
        const { comments, lastDoc: newLastDoc } = await fetchUserComments({
          initialLoad: true,
          userId: serviceProviderID,
        });
        setUserCommentList(comments);
        setLastDoc(newLastDoc);

        // Fetch shop data
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
          setIsBookmark(isBookmarked);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load shop data");
      }
    };
    fetchData();
  }, [serviceProviderID]);

  // Handle scrolling to end of list - load more comments
  const handleEndReached = async () => {
    if (!loadingMoreComments && lastDoc) {
      setLoadingMoreComments(true);
      try {
        const { comments, lastDoc: newLastDoc } = await fetchUserComments({
          userId: serviceProviderID,
          lastDoc,
        });
        setUserCommentList((prev) => [...prev, ...comments]);
        setLastDoc(newLastDoc);
      } catch (error) {
        Alert.alert("Error", "Failed to load more comments");
      } finally {
        setLoadingMoreComments(false);
      }
    }
  };

  // Handle contact option selection
  const handleContactOptionSelect = async (option: string) => {
    if (!shopData || !userData) return;

    const shopDataForChatRoom: ShopDataForCharRoomCreating = {
      serviceProviderUserID: serviceProviderID,
      shopName: shopData.shopName,
      shopProfileImageUrl: shopData.shopPageImageUrl,
    };

    if (option === "Chat") {
      if (userData.userId === serviceProviderID) {
        Alert.alert("You cannot chat with yourself.");
        return;
      }

      const chatRoomId = await createNewChatRoom(shopDataForChatRoom);
      router.push({
        pathname: "/(tabs)/chat/chatWindow/chatUi",
        params: {
          userID: userData.userId,
          chatRoomDocRefId: chatRoomId,
          userRole: "customer",
          otherPartyUserId: serviceProviderID,
        },
      });
    } else if (option === "Share") {
      const message = generateShareMessage(shopData);
      Share.share({ message }).catch(() => Alert.alert("Error", "Failed to share shop"));
    } else if (option === "Call") {
      const phoneUrl = `tel:${shopData.phoneNumber}`;
      Linking.openURL(phoneUrl).catch(() => Alert.alert("Error", "Failed to open dialer"));
    }
  };

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
          <View style={styles.infoRow}>
            <UserReviewStars
              averageRating={shopData.avgRating}
              totalRatings={shopData.dashboardInfo.totalRatings}
            />
            <Text style={styles.locationBadge}>{shopData.shopLocation}</Text>
            <Text style={styles.categoryBadge}>{shopData.shopCategory}</Text>
          </View>
        </View>

        {/* Contact Buttons */}
        <View style={[styles.contactContainerWrapper, { backgroundColor: colors.card_background }]}>
          <View style={styles.contactContainer}>
            <ShopContactInfo onOptionSelect={handleContactOptionSelect} shop={shopListType!} />
          </View>
        </View>

        {/* Service Info */}
        <View style={[styles.serviceInfoContainer, { backgroundColor: colors.card_background }]}>
          <Text style={styles.serviceInfoText}>{shopData.serviceInfo.replace(/\\n/g, "\n")}</Text>
        </View>

        {/* Items Carousel */}
        <View style={styles.itemsContainer}>
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
  headerWrapper: {},
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
  locationBadge: {
    backgroundColor: "#F7F7F7",
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
    backgroundColor: "#F7F7F7",
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
});

export default CustomerShopView;
