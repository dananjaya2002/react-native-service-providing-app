import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Alert,
} from "react-native";

import ShopCard from "../../components/ui/shopCard";
import Header from "../../components/ui/header_Main";
import { Link, router, usePathname } from "expo-router";
import { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { Drawer } from "react-native-drawer-layout";
import { Ionicons } from "@expo/vector-icons";
import MultiSelectComponent, {
  ItemProps as MultiSelectDropdownItemProps,
} from "../../components/thirdPartyComponents/multiSelectItems";
import DisplaySelectedChip from "../../components/ui/displaySelectedChip";
import CategoryCardType2 from "../../components/ui/categoryCardType2";

import {
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
import { db } from "../../FirebaseConfig";

// Types and Interfaces
import {
  ShopList,
  ShopCategory,
  ShopLocationCategory,
  ShopSearchBarItem,
} from "../../interfaces/iShop";
import SearchSection from "../../components/ui/searchSection";
import { getSearchResultShops } from "@/utility/u_getSearchResultShops";
import ShopCardPlaceholder from "@/components/ui/placeholderComponents/shopCardPlaceholder";
import { SystemDataStorage } from "@/storage/functions/systemDataStorage";
import { useTheme } from "../../context/ThemeContext";

const PAGE_SIZE = 10;

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const pathname = usePathname();

  // UI State
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter State
  const [selectedLocations, setSelectedLocations] = useState<ShopLocationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(null);
  const [allServiceCategories, setAllServiceCategories] = useState<ShopCategory[]>([]);
  const [allCities, setAllCities] = useState<Cities[]>([]);
  const [filtersUpdated, setFiltersUpdated] = useState(false);

  // Shop Data State
  const [shops, setShops] = useState<ShopList[]>([]);

  // Pagination State
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const didFetchRef = useRef(false);
  const selectedCategoryRef = useRef<ShopCategory | null>(null);

  // Fetch categories from storage on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      const storedCategories = await SystemDataStorage.getServiceCategories();
      const storedCities = await SystemDataStorage.getCities();

      if (storedCategories) {
        setAllServiceCategories(storedCategories);
      } else {
        console.warn("No categories found in storage.");
      }

      if (storedCities) {
        setAllCities(storedCities);
      } else {
        console.warn("No cities found in storage.");
      }
    };

    fetchCategories();
  }, []);

  // Initial data fetch on mount
  useEffect(() => {
    fetchShopsPage();
    didFetchRef.current = true;
  }, []);

  // Fetch shops when filters are updated
  useEffect(() => {
    if (filtersUpdated) {
      fetchShopsPage();
      setFiltersUpdated(false);
    }
  }, [filtersUpdated]);

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (drawerOpen) {
        setDrawerOpen(false);
        return true;
      }

      // If we're on the home screen and drawer is closed, show exit confirmation
      if (pathname === "/" || pathname === "/(tabs)" || pathname === "/(tabs)/index") {
        Alert.alert(
          "Exit App",
          "Are you sure you want to exit?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Exit", style: "destructive", onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true }
        );
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [drawerOpen, pathname]);

  // Build query constraints based on selected filters
  const buildQueryConstraints = (): QueryConstraint[] => {
    const selectedLocationLabels = selectedLocations.map((location) => location.locationName);
    const tempCategory = selectedCategory;
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

  // Main function to fetch shops from Firestore
  const fetchShopsPage = async (cursor?: QueryDocumentSnapshot<DocumentData>) => {
    setLoading(true);
    try {
      const shopCollection = collection(db, "ShopList");
      const constraints = buildQueryConstraints();
      const q = query(shopCollection, ...constraints, ...(cursor ? [startAfter(cursor)] : []));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const newShops = querySnapshot.docs.map((doc) => {
          const data = doc.data() as ShopList;
          return { ...data, id: doc.id };
        });

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

  // Load more shops when end of list is reached
  const fetchMoreShops = async () => {
    if (!lastDoc || !hasMore || loading) return;
    setIsLoadingMore(true);
    await fetchShopsPage(lastDoc);
    setIsLoadingMore(false);
  };

  // Reset and trigger a new fetch with current filters
  const doFiltering = () => {
    setShops([]);
    setLastDoc(null);
    setHasMore(true);
    setFiltersUpdated(true);
  };

  // Handler for search submissions
  const handleSearchSubmit = async (results: ShopSearchBarItem[]) => {
    setShops([]);
    setLastDoc(null);
    setHasMore(true);

    // Check if search results are empty
    if (!results || results.length === 0) {
      doFiltering();
      return;
    }

    const searchShopResults = await getSearchResultShops(results);
    const resultsWithId = searchShopResults.map((item, index) => ({
      ...item,
      id: item.id || index.toString(),
    }));

    setShops(resultsWithId);
    setHasMore(false);
  };

  // Event Handlers
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

  const handleShopClick = (item: ShopList, gestureEvent: TapGestureHandlerStateChangeEvent) => {
    router.push(`../customer/${item.userDocId}`);
  };

  const handleRemoveLocation = (location: ShopLocationCategory) => {
    setSelectedLocations((prev) => prev.filter((l) => l.id !== location.id));
    doFiltering();
  };

  const handleRemoveCategory = () => {
    setSelectedCategory(null);
    doFiltering();
  };

  // Placeholder items for loading state
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
            data={allCities}
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
            style={[styles.filterButton, { backgroundColor: colors.primary }]}
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
