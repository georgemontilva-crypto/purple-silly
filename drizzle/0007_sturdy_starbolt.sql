ALTER TABLE `products` ADD `secretTitle` varchar(256);--> statement-breakpoint
ALTER TABLE `products` ADD `secretSubtitle` varchar(512);--> statement-breakpoint
ALTER TABLE `products` ADD `secretImageKey` varchar(512);--> statement-breakpoint
ALTER TABLE `products` ADD `secretImageUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `products` ADD `secretCards` json;