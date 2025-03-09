import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text, Animated } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";

// Define type for dropdown items
export interface DropdownItem {
  label: string;
  value: string;
}

interface MultiSelectComponentProps {
  data: DropdownItem[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
}

const MultiSelectItems: React.FC<MultiSelectComponentProps> = ({
  data,
  selected,
  onSelectedChange,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Toggle item selection and propagate change to parent
  const toggleSelection = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onSelectedChange(newSelected);
  };

  // Custom render function for each item in the dropdown
  const renderItem = (item: DropdownItem) => {
    const isSelected = selected.includes(item.value);
    const animatedOpacity = new Animated.Value(1);

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(animatedOpacity, { toValue: 0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(animatedOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      toggleSelection(item.value);
    };

    return (
      <View style={styles.item}>
        <Text style={styles.selectedTextStyle}>{item.label}</Text>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
          <Animated.View style={{ opacity: animatedOpacity }}>
            <AntDesign
              name={isSelected ? "checkcircle" : "checkcircleo"}
              size={20}
              color={isSelected ? "green" : "black"}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <MultiSelect
        style={[styles.dropdown, isFocused && styles.dropdownFocused]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Select Locations"
        value={selected}
        search
        searchPlaceholder="Search..."
        onChange={onSelectedChange} // Pass change events directly to parent handler
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        renderLeftIcon={() => (
          <AntDesign style={styles.icon} color="black" name="filter" size={20} />
        )}
        renderItem={renderItem}
        renderSelectedItem={(item, unSelect) => (
          <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
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
  container: { padding: 2, backgroundColor: "green" },
  dropdown: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
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
    borderColor: "#3498db",
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
    height: 40,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
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
