import { ShopPageData } from "../interfaces/iShop";
export const generateShareMessage = (shopData: ShopPageData) => {
  return `🌟 Check out ${shopData.shopName}! 🌟
  
  ${shopData.shopDescription}
  
  📍 Location: ${shopData.shopLocation}
  ⭐ Average Rating: ${shopData.avgRating.toFixed(1)} / 5
  
  Don't miss out on this amazing service!`;
};
