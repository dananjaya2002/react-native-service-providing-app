import { Ionicons } from "@expo/vector-icons";
import { DocumentSnapshot, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

export interface ShopList {
  id: string;
  rating: number;
  shopName: string;
  shopDescription: string;
  shopPageImageUrl: string;
  totalRatingsCount: number;
  shopCategory: string;
  shopLocation: string;
  shopPageRef: string;
  userDocId: string;
  avgRating: number;
}

export interface ShopCategory {
  categoryID: string;
  categoryName: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export interface ShopLocationCategory {
  id: string;
  locationName: string;
}

export interface UserComment {
  id: string; // Unique ID for the comment
  profileImageUrl: string;
  name: string;
  uploadedDate: Timestamp;
  ratings: number;
  comment: string;
  customerId: string;
}
interface gpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface ShopPageData {
  avgRating: number;
  dashboardInfo: ShopDashboardInfo;
  gpsCoordinates: gpsCoordinates;
  items: ShopServices[];
  phoneNumber: string;
  serviceInfo: string;
  shopCategory: string;
  shopDescription: string;
  shopLocation: string;
  shopName: string;
  shopPageImageUrl: string;
  totalRingsCount: number;
}

export interface ShopServices {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

interface ShopDashboardInfo {
  agreement: string;
  avgRatings: number;
  completed: number;
  items: number;
  messages: number;
  totalComments: number;
  totalRatings: number;
  waiting: number;
}

interface gpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface ShopSearchBarItem {
  id: number;
  doc_id: string;
  shop_id: string;
  shopTitle: string;
}
