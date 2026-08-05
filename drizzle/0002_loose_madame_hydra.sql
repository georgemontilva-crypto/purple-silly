CREATE TABLE `site_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` varchar(128) NOT NULL,
	`label` varchar(256) NOT NULL,
	`key` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`mimeType` varchar(128),
	`sizeBytes` int,
	`width` int,
	`height` int,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_assets_key_unique` UNIQUE(`key`)
);
