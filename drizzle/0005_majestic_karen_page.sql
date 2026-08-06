CREATE TABLE `email_verification_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_verification_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_verification_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` varchar(64) NOT NULL,
	`status` enum('new','contacted','converted','unsubscribed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;