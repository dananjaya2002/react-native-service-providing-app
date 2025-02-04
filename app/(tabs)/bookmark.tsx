// app/(tabs)/bookmarks.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';


const reactLogo = require('../../assets/images/reactLogo.png');
// Sample Data for Bookmarked Shops
const bookmarkedShops = [
  {
    id: '1',
    name: 'AutoMaster Works',
    description: 'From routine maintenance to high-performance upgrades...',
    rating: '4.9 (363)',
    image: reactLogo, // Use the imported image
  },
  {
    id: '2',
    name: 'CarCare Experts',
    description: 'Specializing in car detailing and custom modifications...',
    rating: '4.8 (250)',
    image: reactLogo, // Use the imported image
  },
  {
    id: '3',
    name: 'SpeedMaster Garage',
    description: 'Performance upgrades and engine tuning...',
    rating: '4.7 (180)',
    image: reactLogo, // Use the imported image
  },
];

export default function Bookmarks() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Favorites</Text>

      {/* List of Bookmarked Shops */}
      <FlatList
        data={bookmarkedShops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.shopCard}>
            {/* Shop Image */}
            <Image source={item.image} style={styles.shopImage} /> {/* Fix: Use item.image directly */}
            {/* Shop Details */}
            <View style={styles.shopDetails}>
              <Text style={styles.shopName}>{item.name}</Text>
              <Text style={styles.shopDescription}>{item.description}</Text>
              <Text style={styles.shopRating}>{item.rating}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginTop: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  shopCard: {
    flexDirection: 'row', // Align image and details horizontally
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center', // Align items vertically in the center
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 8, // Rounded corners for the image
    marginRight: 16, // Space between image and text
  },
  shopDetails: {
    flex: 1, // Take up remaining space
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shopDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  shopRating: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
});