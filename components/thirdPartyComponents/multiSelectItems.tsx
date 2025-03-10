import React, { useRef, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text, Animated } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";

// Define type for dropdown items
export interface ItemProps {
  label: string;
  value: string;
}
export interface Location {
  id: string;
  locationName: string;
}

interface MultiSelectComponentProps {
  data: ItemProps[];
  selected: Location[];
  onSelectedChange: (selected: Location[]) => void;
}

const MultiSelectItems: React.FC<MultiSelectComponentProps> = ({
  data,
  selected,
  onSelectedChange,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  // Convert selected full objects to an array of IDs for the MultiSelect component
  const convertedSelected = selected.map((item) => item.id);

  // Toggle item selection and propagate change to parent
  const toggleSelection = (item: ItemProps) => {
    Animated.sequence([
      Animated.timing(animatedOpacity, { toValue: 0.5, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const exists = selected.find((location) => location.id === item.value);
    let newSelected: Location[];
    if (exists) {
      // Remove the item if it's already selected
      newSelected = selected.filter((location) => location.id !== item.value);
    } else {
      // Add the new item as a full object
      newSelected = [...selected, { id: item.value, locationName: item.label }];
    }
    onSelectedChange(newSelected);
  };

  // Custom render function for each item in the dropdown
  const renderItem = (item: ItemProps) => {
    // Check if the item is selected by comparing ids
    const isSelected = selected.some((location) => location.id === item.value);

    return (
      <TouchableOpacity
        onPress={() => toggleSelection(item)}
        activeOpacity={0.7}
        style={styles.item}
      >
        <Text style={styles.selectedTextStyle}>{item.label}</Text>
        <Animated.View style={{ opacity: animatedOpacity }}>
          <AntDesign
            name={isSelected ? "checkcircle" : "checkcircleo"}
            size={20}
            color={isSelected ? "green" : "black"}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <MultiSelect
        style={[styles.dropdown, isFocused && styles.dropdownFocused]}
        containerStyle={styles.itemContainer}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Select Locations"
        value={convertedSelected}
        search={true}
        searchPlaceholder="Search..."
        // onChange is optional here as we handle selection via our custom renderItem & toggleSelection
        onChange={(selectedIds: string[]) => {
          // Optional: Map selectedIds to full objects using data
          const newSelected = data
            .filter((item) => selectedIds.includes(item.value))
            .map((item) => ({ id: item.value, locationName: item.label }));
          onSelectedChange(newSelected);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        renderLeftIcon={() => (
          <AntDesign style={styles.icon} color="black" name="filter" size={20} />
        )}
        renderItem={renderItem}
        renderSelectedItem={(item, unSelect) => (
          <TouchableOpacity
            onPress={() => {
              if (unSelect) {
                unSelect(item);
                // Remove the full object from selected state
                const newSelected = selected.filter((location) => location.id !== item.value);
                onSelectedChange(newSelected);
              }
            }}
          >
            <View style={styles.selectedStyle}>
              <Text style={styles.textSelectedStyle}>{item.label}</Text>
              <AntDesign color="red" name="closecircle" size={17} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default MultiSelectItems;

const styles = StyleSheet.create({
  container: { padding: 2 },
  itemContainer: { borderColor: "#999999", borderRadius: 5, borderWidth: 1 },
  dropdown: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdownFocused: {
    borderColor: "#999999",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#999",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#333",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    paddingHorizontal: 5,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedStyle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 16,
    color: "#333",
  },
});
