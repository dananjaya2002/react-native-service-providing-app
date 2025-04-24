// components/ui/SearchSection.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSearchShopList } from "../../hooks/useSearchShopList";
import { ShopSearchBarItem } from "@/interfaces/iShop";

export interface SearchSectionProps {
  onSearchSubmit: (results: ShopSearchBarItem[]) => void;
  placeholder?: string;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  onSearchSubmit,
  placeholder = "Search",
}) => {
  const [searchText, setSearchText] = useState("");
  const [shouldDisplayResults, setShouldDisplayResults] = useState(false);

  const { results, loading, error } = useSearchShopList(searchText);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    if (shouldDisplayResults === false) {
      setShouldDisplayResults(true); // Show results when typing
    }
    if (!searchText.trim()) {
      setShouldDisplayResults(false);
    }
  };

  const handleSubmit = () => {
    // Remove duplicates based on `doc_id`
    const uniqueResults = results.filter(
      (item, index, self) => index === self.findIndex((t) => t.doc_id === item.doc_id)
    );
    console.log("Submitted search results:", uniqueResults);
    onSearchSubmit(uniqueResults); // Send current results to parent
    setShouldDisplayResults(false); // Toggle the state
  };

  return (
    <View style={styles.wrapper}>
      {/* Search bar */}
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={searchText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Ionicons name="search-sharp" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search results list */}
      {searchText.length >= 3 && shouldDisplayResults && (
        <View style={styles.resultsWrapper}>
          {loading && <ActivityIndicator size="small" color="#333" style={{ margin: 10 }} />}
          {error && <Text style={styles.errorText}>Error: {error.message}</Text>}
          {!loading && !error && results.length === 0 && (
            <Text style={styles.infoText}>No results found.</Text>
          )}
          <ScrollView style={styles.resultsContainer}>
            {results.map((item) => (
              <View key={item.doc_id} style={styles.resultItem}>
                <Text style={styles.resultText}>{item.shopTitle}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default SearchSection;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    zIndex: 10,
  },
  container: {
    flexDirection: "row",
    height: 50,
    backgroundColor: "#d6d6d6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  button: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  resultsWrapper: {
    marginTop: 1,
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
  },
  resultsContainer: {
    maxHeight: 200,
    position: "absolute", // Make it absolute
    top: "100%", // Position it below the search bar
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it appears above other elements
    backgroundColor: "#FFF", // Add background to avoid transparency issues
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomColor: "#EEE",
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
  infoText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    marginVertical: 8,
  },
});
