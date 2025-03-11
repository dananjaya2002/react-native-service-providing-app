import { Ionicons } from "@expo/vector-icons";

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

interface Category {
  categoryID: string;
  categoryName: string;
  iconName: keyof typeof Ionicons.glyphMap;
}
