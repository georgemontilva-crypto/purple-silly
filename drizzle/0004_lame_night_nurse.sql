CREATE TABLE `product_bundles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`label` varchar(128) NOT NULL,
	`quantity` int NOT NULL,
	`priceCents` int NOT NULL,
	`compareAtCents` int,
	`badge` varchar(64),
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_bundles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`imageKey` varchar(512),
	`imageUrl` varchar(1024),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`r2Key` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`alt` varchar(256),
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`title` varchar(128) NOT NULL,
	`sku` varchar(128),
	`priceCents` int NOT NULL,
	`compareAtCents` int,
	`stock` int NOT NULL DEFAULT 0,
	`imageKey` varchar(512),
	`imageUrl` varchar(1024),
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`slug` varchar(256) NOT NULL,
	`description` text,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`featured` boolean NOT NULL DEFAULT false,
	`categoryId` int,
	`tags` json NOT NULL,
	`seoTitle` varchar(256),
	`seoDescription` varchar(512),
	`ingredients` text,
	`howToTake` text,
	`disclaimer` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
