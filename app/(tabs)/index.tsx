import React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';

const reactLogo = require('../../assets/images/reactLogo.png');

// Sample Data for Shops
const Shops = [
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

interface Shop {
  id: string;
  name: string;
  description: string;
  rating: string;
  image: any;
}

const ShopCard = ({ item }: { item: Shop }) => (
  <TouchableOpacity style={styles.shopCard}>
    <Image source={item.image} style={styles.shopImage} />
    <View style={styles.shopDetails}>
      <Text style={styles.shopName}>{item.name}</Text>
      <Text style={styles.shopDescription}>{item.description}</Text>
      <Text style={styles.shopRating}>{item.rating}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search for services or shops..." />
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterText}>Filter:</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Category 1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Category 2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Category 3</Text>
        </TouchableOpacity>
      </View>

      {/* Shop List */}
      <FlatList
        data={Shops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ShopCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginTop: Platform.OS === 'ios' ? 0 : 24,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  filterButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginLeft: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  shopCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  shopDetails: {
    flex: 1,
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
