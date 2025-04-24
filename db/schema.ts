import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const shopSearchList = sqliteTable("shop_search_lists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  docId: text("doc_id").notNull(), // Firestore document id for matching updates/deletions
  shopId: text("shop_id").notNull(),
  shopTitle: text("shopTitle").notNull(),
});

// Export Task to use as an interface in your app
export type Task = typeof shopSearchList.$inferSelect;
