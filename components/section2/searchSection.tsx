import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SearchSectionProps {
  // Callback returns the current search value when search is triggered
  onSearch: (searchValue: string) => void;
  placeholder?: string;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, placeholder = "Search" }) => {
  const [searchText, setSearchText] = useState("");

  const onSearchButtonPressed = () => {
    // Return the current search value to the parent component
    onSearch(searchText);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={onSearchButtonPressed}
      />
      <TouchableOpacity style={styles.button} onPress={onSearchButtonPressed}>
        <Ionicons name="search-sharp" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchSection;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 50,
    width: "100%",
    backgroundColor: "#FDE68A", // similar to bg-yellow-500
    borderRadius: 8,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    borderColor: "#D1D5DB", // gray-300
    borderWidth: 1,
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
});
