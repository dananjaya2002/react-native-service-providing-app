import { StorageService } from "../asyncStorage";

// Define the item structure
export interface ShopItem {
  title: string;
  description: string;
  imageUrl: string;
}

// Define the dashboard information structure
export interface DashboardInfo {
  waitings: number;
  completed: number;
  items: number;
  agreements: number;
  avgRatings: number;
  messages: number;
  totalRatings: number;
  totalComments: number;
}

// Define the complete shop data structure
export interface ShopData {
  ShopName: string;
  ShopDescription: string;
  ShopServiceInfo: string;
  ItemList: {
    [key: string]: ShopItem;
  };
  DashboardInfo: DashboardInfo;
  ShopPageImageUrl: string;
  PhoneNumber: string;
}

// Storage keys as constants
export const SHOP_STORAGE_KEYS = {
  SHOP_DATA: "shop_data",
};

export class ShopStorageService {
  /**
   * Save complete shop data to storage
   */
  static async saveShopData(shopData: ShopData): Promise<void> {
    await StorageService.storeObject<ShopData>(SHOP_STORAGE_KEYS.SHOP_DATA, shopData);
  }

  /**
   * Get complete shop data from storage
   */
  static async getShopData(): Promise<ShopData | null> {
    return await StorageService.getObject<ShopData>(SHOP_STORAGE_KEYS.SHOP_DATA);
  }

  /**
   * Update part of the shop data
   */
  static async updateShopData(partialData: Partial<ShopData>): Promise<void> {
    const currentData = await ShopStorageService.getShopData();

    if (currentData) {
      // Merge the current data with the new partial data
      const updatedData = { ...currentData, ...partialData };
      await ShopStorageService.saveShopData(updatedData);
    } else {
      // If no existing data, treat partial data as complete
      await ShopStorageService.saveShopData(partialData as ShopData);
    }
  }

  /**
   * Add a new item to the shop's item list
   */
  static async addShopItem(itemKey: string, item: ShopItem): Promise<void> {
    const shopData = await ShopStorageService.getShopData();

    if (shopData) {
      // Create a new ItemList with the added item
      const updatedItemList = {
        ...shopData.ItemList,
        [itemKey]: item,
      };

      // Update the shop data with the new ItemList
      await ShopStorageService.updateShopData({
        ItemList: updatedItemList,
      });
    }
  }

  /**
   * Update dashboard information
   */
  static async updateDashboardInfo(dashboardInfo: Partial<DashboardInfo>): Promise<void> {
    const shopData = await ShopStorageService.getShopData();

    if (shopData) {
      const updatedDashboardInfo = {
        ...shopData.DashboardInfo,
        ...dashboardInfo,
      };

      await ShopStorageService.updateShopData({
        DashboardInfo: updatedDashboardInfo,
      });
    }
  }

  /**
   * Clear shop data from storage
   */
  static async clearShopData(): Promise<void> {
    await StorageService.removeItem(SHOP_STORAGE_KEYS.SHOP_DATA);
  }

  /**
   * Initialize with default shop data if none exists
   */
  static async initializeWithDefaultData(): Promise<void> {
    const existingData = await ShopStorageService.getShopData();

    if (!existingData) {
      console.log(" \n🟥🟥 Not data found, Initializing with default shop data 🟥🟥\n");
      const defaultShopData: ShopData = {
        ShopName: "Nimal Auto Care",
        ShopDescription: "Reliable and affordable auto repair services in Colombo.",
        ShopServiceInfo:
          "Expert vehicle repairs, servicing, and maintenance with genuine spare parts.",
        ItemList: {
          item1: {
            title: "Engine Oil Change",
            description: "High-quality synthetic and mineral engine oil change.",
            imageUrl:
              "https://res.cloudinary.com/dpjdmbozt/image/upload/v1739022204/pexels-photo-13065690_b6uhwg.jpg",
          },
          item2: {
            title: "Wheel Alignment & Balancing",
            description: "Computerized wheel alignment for better stability and tire life.",
            imageUrl:
              "https://res.cloudinary.com/dpjdmbozt/image/upload/v1739022274/pexels-photo-3806280_h0563i.jpg",
          },
          item3: {
            title: "Battery Replacement",
            description: "Wide range of vehicle batteries with free installation.",
            imageUrl:
              "https://res.cloudinary.com/dpjdmbozt/image/upload/v1739022331/pexels-photo-4374843_h6ehxm.jpg",
          },
          item4: {
            title: "AC Repair & Gas Refill",
            description: "Comprehensive car AC servicing, repairs, and gas refilling.",
            imageUrl:
              "https://res.cloudinary.com/dpjdmbozt/image/upload/v1739022409/pexels-photo-6471913_lkwmrs.jpg",
          },
        },
        DashboardInfo: {
          waitings: 12,
          completed: 45,
          items: 85,
          agreements: 5,
          avgRatings: 4.6,
          messages: 3,
          totalRatings: 275,
          totalComments: 13,
        },
        ShopPageImageUrl:
          "https://res.cloudinary.com/dpjdmbozt/image/upload/v1739022522/pexels-photo-4480505_zylzvi.jpg",
        PhoneNumber: "077-345-6789",
      };

      await ShopStorageService.saveShopData(defaultShopData);
    }
  }
}
