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
  StyleSheet,
} from "react-native";

import ShopCard from "../../components/ui/shopCard";
import Header from "../../components/ui/header_Main";
//import { Category } from "../../components/section2/categoriesList";
import CategoriesList from "../../components/ui/categoriesList";

import shopData from "../../assets/Data/data2";
import SearchBar from "../../components/ui/searchSection";
import { Link, router } from "expo-router";
import { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { Drawer } from "react-native-drawer-layout";
import { Ionicons } from "@expo/vector-icons";
import MultiSelectComponent, {
  ItemProps as MultiSelectDropdownItemProps,
} from "../../components/thirdPartyComponents/multiSelectItems";
import DisplaySelectedChip from "../../components/ui/displaySelectedChip";

import CategoryCardType2, { CategoryCardType2Props } from "../../components/ui/categoryCardType2";

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

// Typescript Interfaces
import {
  ShopList,
  ShopCategory,
  ShopLocationCategory,
  ShopSearchBarItem,
} from "../../interfaces/iShop";
// import { ShopMinimal, useSyncShopsSQL } from "@/hooks/useLocalShopList";
import { searchLocalShops } from "@/utility/u_searchShops";
import SearchSection from "../../components/ui/searchSection";
import { getSearchResultShops } from "@/utility/u_getSearchResultShops";
import ShopCardPlaceholder from "@/components/ui/placeholderComponents/shopCardPlaceholder";
import { SystemDataStorage } from "@/storage/functions/systemDataStorage";
import { useTheme } from "../../context/ThemeContext";
const reactLogo = require("../../assets/images/reactLogo.png");

// interface Shop {
//   id: string;
//   rating: number;
//   title: string;
//   description: string;
//   imageUrl: string;
//   totalRatings: number;
//   category: string;
//   location: string;
//   shopPageRef: string;
//   userDocId: string;
//   avgRating: number;
// }
const data: MultiSelectDropdownItemProps[] = [
  { label: "Colombo", value: "1" },
  { label: "Kandy", value: "2" },
  { label: "Galle", value: "3" },
  { label: "Jaffna", value: "4" },
  { label: "Negombo", value: "5" },
];
// const dummyData: Record<string, ShopCategory> = {
//   cat1: {
//     categoryID: "cat1",
//     categoryName: "Automotive",
//     iconName: "car",
//   },
//   cat2: {
//     categoryID: "cat2",
//     categoryName: "Electronics",
//     iconName: "hardware-chip",
//   },
//   cat3: {
//     categoryID: "cat3",
//     categoryName: "Beauty",
//     iconName: "flower",
//   },
//   cat4: {
//     categoryID: "cat4",
//     categoryName: "Cleaning",
//     iconName: "water",
//   },
//   cat5: {
//     categoryID: "cat5",
//     categoryName: "Transport",
//     iconName: "bus",
//   },
//   cat6: {
//     categoryID: "cat6",
//     categoryName: "Home Fix",
//     iconName: "hammer",
//   },
// };
const PAGE_SIZE = 5;

const HomeScreen: React.FC = () => {
  const { colors, theme, setTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false); // Drawer State

  const [selectedLocations, setSelectedLocations] = useState<ShopLocationCategory[]>([]); // Selected Locations
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(null); // Selected ShopCategory
  const [allServiceCategories, setAllServiceCategories] = useState<ShopCategory[]>([]);

  const [shops, setShops] = useState<ShopList[]>([]); // ShopList List

  // Pagination State
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false); // Flag to check if more data is available

  const [filtersUpdated, setFiltersUpdated] = useState(false); // Flag to trigger re-fetch

  const didFetchRef = useRef(false); // Dev only flag to prevent re-fetching

  const combinedChips = [...selectedLocations, selectedCategory];

  const selectedCategoryRef = useRef<ShopCategory | null>(null);

  useEffect(() => {
    // Fetch categories from storage on component mount
    const fetchCategories = async () => {
      const storedCategories = await SystemDataStorage.getServiceCategories();
      if (storedCategories) {
        setAllServiceCategories(storedCategories);
      } else {
        console.warn("No categories found in storage.");
      }
    };

    fetchCategories();
  }, []);

  // Callback passed to SearchSection
  const handleSearchSubmit = async (results: ShopSearchBarItem[]) => {
    console.log("Submit Button Pressed!");
    setShops([]);
    setLastDoc(null);
    setHasMore(true);

    const searchShopResults = await getSearchResultShops(results);
    const resultsWithId = searchShopResults.map((item, index) => ({
      ...item,
      id: item.id || index.toString(), // Use `id` if available, otherwise fallback to index
    }));

    console.log("\n\nSearch Results:", searchShopResults);
    setShops(resultsWithId);
    setHasMore(false); // No more pages after search
  };

  const buildQueryConstraints = (): QueryConstraint[] => {
    const selectedLocationLabels = selectedLocations.map((location) => location.locationName);
    console.log("Selected Locations:", selectedLocationLabels);

    //const tempCategory = selectedCategoryRef.current;
    const tempCategory = selectedCategory;
    console.log("Selected ShopCategory:", tempCategory);
    const constraints: QueryConstraint[] = [];

    if (selectedLocationLabels.length > 0) {
      constraints.push(
        selectedLocationLabels.length === 1
          ? where("shopLocation", "==", selectedLocationLabels[0])
          : where("shopLocation", "in", selectedLocationLabels)
      );
    }
    if (tempCategory) {
      constraints.push(where("shopCategory", "==", tempCategory.categoryName));
    }
    constraints.push(orderBy("totalRatingsCount", "asc"), limit(PAGE_SIZE));
    return constraints;
  };

  /**
   *
   * Main function to fetch shops from Firestore
   * @param cursor
   *
   *
   */
  const fetchShopsPage = async (cursor?: QueryDocumentSnapshot<DocumentData>) => {
    if (didFetchRef.current) {
      console.log("🟥 Force Stopped Fetching");
      return; // Dev MOD to prevent re-fetching
    }
    didFetchRef.current = true;

    console.log("⏬⏬ Fetching ⏬⏬");
    setLoading(true);
    try {
      const shopCollection = collection(db, "ShopList");

      console.log("\nshopLocations:", selectedLocations);
      console.log("\nshopCategory:", selectedCategory);

      const constraints = buildQueryConstraints();

      const q = query(shopCollection, ...constraints, ...(cursor ? [startAfter(cursor)] : []));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const newShops = querySnapshot.docs.map((doc) => {
          const data = doc.data() as ShopList;
          return { ...data, id: doc.id };
        });

        //console.log("\n 🟨 Fetched New Data:", newShops);

        // Append or set shops based on pagination
        if (cursor) {
          setShops((prev) => [...prev, ...newShops]);
        } else {
          setShops(newShops);
        }
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === PAGE_SIZE); // Check if more data is available
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
    setLoading(false);
  };

  // Initial fetch on mount
  useEffect(() => {
    //fetchShopsPage(); // This line is enough to fetch the first page
    // if (__DEV__ && didFetchRef.current) return console.log("🟩 Already fetched shops!");
    fetchShopsPage();
    didFetchRef.current = true;
  }, []);

  /**
   *
   * Fetch shops when required filter filters are updated
   *
   */
  useEffect(() => {
    if (filtersUpdated) {
      fetchShopsPage();
      setFiltersUpdated(false); // Reset flag
    }
  }, [filtersUpdated]);

  const doFiltering = () => {
    setShops([]);
    setLastDoc(null);
    setHasMore(true);
    setFiltersUpdated(true); // Trigger re-fetch via useEffect
  };

  // Load more shops when end is reached
  const fetchMoreShops = async () => {
    if (!lastDoc || !hasMore || loading) return;
    setIsLoadingMore(true);
    await fetchShopsPage(lastDoc);
    setIsLoadingMore(false);
  };

  // ShopCategory card  Press Handler
  const handleCategoryCardPress = (category?: ShopCategory) => {
    setDrawerOpen(false);
    const newCategory = category || null;
    setSelectedCategory(newCategory);
    selectedCategoryRef.current = newCategory;
    doFiltering();
  };

  const handleFilterButtonPress = () => {
    setDrawerOpen(false);
    doFiltering();
  };

  // To Close Drawer on Back Button Press
  useEffect(() => {
    const backAction = () => {
      if (drawerOpen) {
        setDrawerOpen(false); // Close the drawer if it is drawerOpen
        return true; // Prevent default back action
      }
      return false; // Allow default back action if drawer is not drawerOpen
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
  }, [drawerOpen]);

  const handleShopClick = (item: ShopList, gestureEvent: TapGestureHandlerStateChangeEvent) => {
    console.log("UserDocId = ", item.userDocId);
    router.push(`../customer/${item.userDocId}`);
  };

  // Remove a location chip by filtering it out
  const handleRemoveLocation = (location: ShopLocationCategory) => {
    setSelectedLocations((prev) => prev.filter((l) => l.id !== location.id));
    doFiltering();
    console.log("Removed ShopLocationCategory:", location);
  };

  // Remove the category chip by setting it to null
  const handleRemoveCategory = () => {
    //setShops([]);
    //setLastDoc(null);
    setSelectedCategory(null);
    //selectedCategoryRef.current = null;
    //setHasMore(true);
    //setFiltersUpdated(true); // Trigger re-fetch via useEffect
    doFiltering();

    console.log("Removed ShopCategory");
  };

  // Determine how many placeholders to show if loading
  const placeholderItems = Array.from({ length: 10 }, (_, index) => index);

  return (
    <Drawer
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      drawerPosition="right"
      drawerStyle={[styles.drawer, { backgroundColor: colors.background }]}
      renderDrawerContent={() => (
        <View style={styles.drawerContent}>
          <Text style={styles.filterTitle}>Filter Options</Text>

          <MultiSelectComponent
            data={data}
            selected={selectedLocations}
            onSelectedChange={setSelectedLocations}
          />

          <View style={styles.flatListContainer}>
            <FlatList
              data={Object.values(allServiceCategories)}
              keyExtractor={(item) => item.categoryID}
              renderItem={({ item }) => (
                <CategoryCardType2 category={item} onCategoryPress={handleCategoryCardPress} />
              )}
              contentContainerStyle={styles.categoryListContent}
            />
          </View>

          <TouchableOpacity
            onPress={handleFilterButtonPress}
            style={[styles.filterButton, { backgroundColor: colors.secondary }]}
          >
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      {/* Main Content of the Home Screen */}
      <View style={[styles.main, { backgroundColor: colors.background }]}>
        <Header title="Home" showProfileIcon={true} showLogoutButton={true} />

        <View style={styles.searchRow}>
          <View style={styles.searchSection}>
            <SearchSection onSearchSubmit={handleSearchSubmit} placeholder="Search items..." />
          </View>

          <View style={[styles.filterToggleButton, { backgroundColor: "#004887" }]}>
            <TouchableOpacity
              onPress={() => setDrawerOpen((prev) => !prev)}
              style={styles.filterIconButton}
            >
              <Ionicons name="filter" size={36} color="#ffff" />
            </TouchableOpacity>
          </View>
        </View>

        <DisplaySelectedChip
          selectedLocations={selectedLocations}
          selectedCategory={selectedCategory}
          onRemoveLocation={handleRemoveLocation}
          onRemoveCategory={handleRemoveCategory}
        />

        <View style={styles.shopListContainer}>
          {loading && !isLoadingMore ? (
            <FlatList
              data={placeholderItems}
              keyExtractor={(item) => item.toString()}
              renderItem={() => <ShopCardPlaceholder />}
            />
          ) : (
            <FlatList
              data={shops}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ShopCard item={item} onShopClick={handleShopClick} />}
              onEndReached={fetchMoreShops}
            />
          )}
        </View>
      </View>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  drawer: {
    width: 300,
    padding: 20,
  },
  drawerContent: {
    flex: 1,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  flatListContainer: {
    flex: 1,
    marginTop: 10,
  },
  categoryListContent: {
    padding: 10,
  },
  filterButton: {
    padding: 16,
    borderRadius: 12,
    alignSelf: "center",
    width: "90%",
  },
  filterButtonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  main: {
    flex: 1,
  },
  searchRow: {
    flexDirection: "row",
    height: 50,
    marginHorizontal: 8,
  },
  searchSection: {
    flex: 1,
    marginRight: 4,
  },
  filterToggleButton: {
    width: 50,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  filterIconButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shopListContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
});

export default HomeScreen;
