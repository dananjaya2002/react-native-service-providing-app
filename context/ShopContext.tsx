// app/context/ShopContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

export type SubServiceData = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
};

type ShopContextType = {
  shop: SubServiceData[];
  setShop: (shop: SubServiceData[]) => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [shop, setShop] = useState<SubServiceData[]>([]);
  return <ShopContext.Provider value={{ shop, setShop }}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};
