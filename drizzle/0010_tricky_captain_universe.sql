CREATE TABLE `home_reels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(128),
	`videoKey` varchar(512) NOT NULL,
	`videoUrl` varchar(1024) NOT NULL,
	`posterKey` varchar(512),
	`posterUrl` varchar(1024),
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `home_reels_id` PRIMARY KEY(`id`)
);
