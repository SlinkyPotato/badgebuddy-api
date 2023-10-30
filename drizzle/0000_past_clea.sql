-- CREATE DATABASE `badge_buddy`;
--> statement-breakpoint
CREATE TABLE `badge_buddy`.`discord_guilds` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`guild_id` bigint unsigned NOT NULL,
	`name` varchar(100),
	`news_channel_id` bigint unsigned NOT NULL,
	`poap_manager_role_id` bigint unsigned NOT NULL,
	`poap_command_channel_id` bigint unsigned NOT NULL,
	CONSTRAINT `discord_guilds_id` PRIMARY KEY(`id`),
	CONSTRAINT `discord_guilds_guild_id_unique` UNIQUE(`guild_id`),
	CONSTRAINT `guild_id_index` UNIQUE(`id`),
	CONSTRAINT `news_channel_id_index` UNIQUE(`news_channel_id`),
	CONSTRAINT `poap_manager_role_id_index` UNIQUE(`poap_manager_role_id`),
	CONSTRAINT `poap_command_channel_id_index` UNIQUE(`poap_command_channel_id`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` varchar(255),
	`access_token` varchar(255),
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` varchar(255),
	`session_state` varchar(255),
	CONSTRAINT `account_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `session_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp(3) DEFAULT (now()),
	`image` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verificationToken_identifier_token` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;
