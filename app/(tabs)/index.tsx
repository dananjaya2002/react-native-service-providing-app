import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  BackHandler,
} from "react-native";

import ShopCard from "../../components/section2/shopCard";
import Header from "../../components/section2/header_Main";
import { Category } from "../../components/section2/categoriesList";
import CategoriesList from "../../components/section2/categoriesList";

import shopData from "../../assets/Data/data2";
import SearchBar from "../../components/section2/searchSection";
import { Link, router } from "expo-router";
import { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { Drawer } from "react-native-drawer-layout";
import { Ionicons } from "@expo/vector-icons";
import MultiSelectComponent, {
  DropdownItem,
} from "../../components/thirdPartyComponents/multiSelectItems";

import CategoryCardType2, {
  CategoryCardType2Props,
} from "../../components/section2/categoryCardType2";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  where,
  QueryConstraint,
} from "firebase/firestore";
import { app, db } from "../../FirebaseConfig";

const reactLogo = require("../../assets/images/reactLogo.png");

interface Shop {
  id: string;
  rating: number;
  title: string;
  description: string;
  imageUrl: string;
  totalRatings: number;
  category: string;
  location: string;
  shopPageRef: string;
  userDocId: string;
  avgRating: number;
}
const data: DropdownItem[] = [
  { label: "Colombo", value: "1" },
  { label: "Dehiwala", value: "2" },
  { label: "Mount Lavinia", value: "3" },
  { label: "Sri JP", value: "4" },
  { label: "Kottawa", value: "5" },
  { label: "Maharagama", value: "6" },
  { label: "Homagama", value: "7" },
  { label: "Nugegoda", value: "8" },
];

const dummyData: Record<string, Category> = {
  cat1: {
    categoryID: "cat1",
    categoryName: "PC Repair",
    iconName: "home", // Make sure "water-outline" exists in Ionicons.glyphMap
  },
  cat2: {
    categoryID: "cat2",
    categoryName: "Grocery",
    iconName: "car",
  },
  cat3: {
    categoryID: "cat3",
    categoryName: "Cooking",
    iconName: "cellular",
  },
};
const PAGE_SIZE = 5;

const HomeScreen: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]); // Selected Locations
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Selected Category

  const [shops, setShops] = useState<Shop[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const didFetchRef = useRef(false);

  const buildQueryConstraints = (): QueryConstraint[] => {
    console.log("Selected Locations:", selectedLocations);
    const constraints: QueryConstraint[] = [];
    if (selectedLocations.length > 0) {
      constraints.push(
        selectedLocations.length === 1
          ? where("shopLocation", "==", selectedLocations[0])
          : where("shopLocation", "in", selectedLocations)
      );
    }
    if (selectedCategory) {
      constraints.push(where("shopCategory", "==", selectedCategory));
    }
    constraints.push(orderBy("totalRatingsCount", "asc"), limit(PAGE_SIZE));
    return constraints;
  };

  // Combined function to fetch shops
  const fetchShopsPage = async (cursor?: QueryDocumentSnapshot<DocumentData>) => {
    setLoading(true);
    try {
      const shopCollection = collection(db, "ShopList");

      console.log("\nshopLocations:", selectedLocations);
      console.log("\nshopCategory:", selectedCategory);

      const constraints = buildQueryConstraints();

      const q = query(shopCollection, ...constraints);
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const newShops = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            rating: data.avgRating, // map avgRating to rating for compatibility
            avgRating: data.avgRating,
            title: data.shopName,
            description: data.shopDescription,
            imageUrl: data.shopPageImageUrl,
            totalRatings: data.totalRatingsCount,
            category: data.shopCategory,
            location: data.shopLocation,
            shopPageRef: data.shopPageRef,
            userDocId: data.userDocId,
          } as Shop;
        });

        //console.log("\n 🟨 Fetched New Data:", newShops);

        // Append or set shops based on pagination
        if (cursor) {
          setShops((prev) => [...prev, ...newShops]);
        } else {
          setShops(newShops);
        }
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
    setLoading(false);
  };

  const doFiltering = () => {
    setShops([]);
    setLastDoc(null);
    setHasMore(true);
    fetchShopsPage();
  };

  // Initial fetch on mount
  useEffect(() => {
    //fetchShopsPage(); // This line is enough to fetch the first page
    if (__DEV__ && didFetchRef.current) return console.log("🟩 Already fetched shops!");
    fetchShopsPage();
    didFetchRef.current = true;
  }, []);

  // Re-fetch when filters change (reset state)
  useEffect(() => {
    // // Reset shops and pagination state when filters update
    // setShops([]);
    // setLastDoc(null);
    // setHasMore(true);
    // fetchShopsPage();
    console.log("🟦 Filters changed:", selectedLocations, selectedCategory);
  }, [selectedLocations, selectedCategory]);

  // Load more shops when end is reached
  const fetchMoreShops = async () => {
    if (!lastDoc || !hasMore || loading) return;
    await fetchShopsPage(lastDoc);
  };

  // Category card  Press Handler
  const handleCategoryCardPress = (categoryName?: string) => {
    setSelectedCategory(categoryName || null);
    doFiltering();
  };

  const handleFilterButtonPress = () => {
    console.log("Filter button pressed!");
    doFiltering();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Temporary Not in use
  };

  // To Close Drawer on Back Button Press
  useEffect(() => {
    const backAction = () => {
      if (open) {
        setOpen(false); // Close the drawer if it is open
        return true; // Prevent default back action
      }
      return false; // Allow default back action if drawer is not open
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    // Add a custom back handler for iOS
    if (Platform.OS === "ios") {
      const iosBackHandler = () => {
        return true; // Prevent default behavior for iOS
      };

      // Add event listener for iOS-specific back behavior
      const iosBackListener = BackHandler.addEventListener("hardwareBackPress", iosBackHandler);
      return () => iosBackListener.remove();
    }

    return () => backHandler.remove();
  }, [open]);

  const handleShopClick = (gestureEvent: TapGestureHandlerStateChangeEvent) => {
    console.log("Shop tapped!", gestureEvent.nativeEvent);
    const shopId = "123";
    router.push(`../customer/${shopId}`);
  };

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      drawerPosition="right" // Slide from right to left
      drawerStyle={{
        backgroundColor: "#ecf0f1",
        width: 300,
        padding: 20,
      }}
      renderDrawerContent={() => (
        <View className="flex-1 bg-fuchsia-300">
          {/* Slide Left Menu */}
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Filter Options</Text>
          <MultiSelectComponent
            data={data}
            selected={selectedLocations}
            onSelectedChange={setSelectedLocations}
          />

          <View className="flex-1 bg-yellow-100">
            {/* Vertical Category Cards */}
            <FlatList
              data={Object.values(dummyData)} // Convert object to array
              keyExtractor={(item) => item.categoryID}
              renderItem={({ item }) => (
                <CategoryCardType2 category={item} onCategoryPress={handleCategoryCardPress} />
              )}
              contentContainerStyle={{ backgroundColor: "#cb96f0", padding: 10 }}
            />
          </View>

          {/* Filter Button at the bottom */}
          <TouchableOpacity
            onPress={() => handleFilterButtonPress()}
            className="p-4 bg-blue-700"
            style={{ position: "absolute", bottom: 0, width: "100%", borderRadius: 15 }}
          >
            <Text className="font-bold text-white text-lg self-center">Filter</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      {/* Main Section  */}
      <View className="flex-1 bg-primary">
        <Header title="Home" onPressBack={() => console.log("Back pressed")} />
        <View className="flex-row h-[50] mx-2">
          <View className="flex-1 mr-1">
            {/* Search Bar Section  */}
            <SearchBar onSearch={handleSearch} placeholder="Search items..." />
          </View>
          <View className="bg-green-600 w-[50] h-full justify-center item-center">
            {/* Slider Sheet Button  */}
            <TouchableOpacity
              onPress={() => setOpen((prev) => !prev)}
              style={{
                backgroundColor: "#f2f2f2",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="menu" size={36} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Category List */}
        <CategoriesList categories={dummyData} onCategoryPress={handleCategoryCardPress} />
        {/* Shop List */}
        <View className="flex-1 px-2">
          <FlatList
            data={shops}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ShopCard item={item} onShopClick={handleShopClick} />}
            onEndReached={fetchMoreShops}
          />
        </View>
      </View>
    </Drawer>
  );
};

export default HomeScreen;
