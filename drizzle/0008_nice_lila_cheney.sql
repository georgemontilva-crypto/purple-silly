CREATE TABLE `promo_popups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`subtitle` varchar(512),
	`bodyText` text,
	`discountCode` varchar(64) NOT NULL,
	`buttonText` varchar(128) NOT NULL,
	`imageKey` varchar(512),
	`imageUrl` varchar(1024),
	`active` boolean NOT NULL DEFAULT false,
	`showDelaySeconds` int NOT NULL DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promo_popups_id` PRIMARY KEY(`id`)
);
