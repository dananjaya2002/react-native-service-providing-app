import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const shopSearchList = sqliteTable("shop_search_lists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shopId: text("shop_id").notNull(),
  shopTitle: text("shopTitle").notNull(),
});

// Export Task to use as an interface in your app
export type Task = typeof shopSearchList.$inferSelect;
