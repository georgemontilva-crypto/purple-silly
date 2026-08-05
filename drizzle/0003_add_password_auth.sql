ALTER TABLE `users` DROP INDEX `users_openId_unique`;
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255) DEFAULT '';
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `passwordHash` varchar(255) NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN `passwordHash` DROP DEFAULT;
--> statement-breakpoint
UPDATE `users` SET `email` = CONCAT('user-', `id`, '@migrated.invalid') WHERE `email` IS NULL;
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;
