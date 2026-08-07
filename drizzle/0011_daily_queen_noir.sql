CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorName` varchar(128) NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`title` varchar(256) NOT NULL,
	`body` text NOT NULL,
	`productName` varchar(256),
	`verified` boolean NOT NULL DEFAULT false,
	`imageKey` varchar(512),
	`imageUrl` varchar(1024),
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
-- Seed: the store owner's five real customer reviews, published with their
-- authorization. Guarded by NOT EXISTS on the table being empty so that
-- re-running the migration on a database an admin has already edited can't
-- duplicate them or resurrect ones that were deleted on purpose.
INSERT INTO `reviews` (`authorName`, `rating`, `title`, `body`, `productName`, `verified`, `position`, `active`)
SELECT * FROM (
	SELECT 'Anonymous' AS a, 5 AS b, 'The super doses are amazing' AS c, 'The super doses are amazing. Def don''t take all three if you are a lightweight' AS d, 'Silly Dots Super Dose' AS e, true AS f, 0 AS g, true AS h
	UNION ALL SELECT 'Michael W.', 5, 'SillyDots', 'Silly Dots are really awesome from the Mega Dose to the Hero Dose all the way to the Super Dose. They''re all different experiences.', 'Silly Dots Hero Dose 1800mg', true, 1, true
	UNION ALL SELECT 'Adam S.', 5, 'Holy @#$&', 'These things are amazing. I took all 3 and I could hear my voice echo and everything looked wild. 15/10 would recommend. Get em while you can.', 'Silly Dots Super Dose 2400mg', true, 2, true
	UNION ALL SELECT 'Latashua S.', 5, 'The best party!!', 'I got these from D8 gas and ever since I have been looking for them so excited they have a party pack so I make sure I am stocked up! You should definitely try them out.', 'Silly Dots Mega Dose 1200mg', true, 3, true
	UNION ALL SELECT 'Z B.', 5, 'Not sure what it is, but it''s pretty nice', 'Makes me feel like I''m floating kinda and very carefree… very nice after a long day of work or blissful day at a pool.', 'Silly Dots Mega Dose 1200mg', true, 4, true
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `reviews`);
