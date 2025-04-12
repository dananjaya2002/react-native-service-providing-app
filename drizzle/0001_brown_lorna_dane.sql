PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_shop_search_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shop_id` text NOT NULL,
	`shopTitle` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_shop_search_lists`("id", "shop_id", "shopTitle") SELECT "id", "shop_id", "shopTitle" FROM `shop_search_lists`;--> statement-breakpoint
DROP TABLE `shop_search_lists`;--> statement-breakpoint
ALTER TABLE `__new_shop_search_lists` RENAME TO `shop_search_lists`;--> statement-breakpoint
PRAGMA foreign_keys=ON;