import { Dimensions, ScrollView, View, StyleSheet, Pressable, Image, Text } from "react-native";

// TypeScript interfaces
import { ShopServices } from "../../interfaces/iShop";
/**
 * Horizontal scrolling component with tiles
 *
 * @param items - Array of items --> imageUrl, title, name
 *
 */

type HorizontalScrollViewProps = {
  items: ShopServices[];
};

const { width } = Dimensions.get("window");
const itemWidth = (width / 3) * 2;
const gap = (width - itemWidth) / 4;

const HorizontalScrollView: React.FC<HorizontalScrollViewProps> = ({ items }) => {
  const handlePress = (item: ShopServices) => {
    console.log("ShopServices pressed:", item);
  };

  return (
    <ScrollView
      horizontal
      pagingEnabled
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth + gap}
      contentContainerStyle={{ paddingHorizontal: 10 }}
    >
      {items.map((item, index) => (
        <Pressable key={index} onPress={() => handlePress(item)} style={styles.itemContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={5}>
              {item.description}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: 260,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  titleContainer: {
    height: 40,
    justifyContent: "center",
    backgroundColor: "white",
  },
  titleText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  imageContainer: {
    height: 230,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  descriptionContainer: {
    flex: 1,
    height: "auto",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  descriptionText: {
    color: "black",
    fontWeight: "normal",
    fontSize: 12,
  },
});
export default HorizontalScrollView;
