ALTER TABLE `poems` ADD `ratings_enabled` integer DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE `poems` ADD `comments_enabled` integer DEFAULT true NOT NULL;
--> statement-breakpoint
CREATE TABLE `poem_ratings` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `poem_id` integer NOT NULL,
  `voter_token_hash` text NOT NULL,
  `value` integer NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`poem_id`) REFERENCES `poems`(`id`) ON DELETE CASCADE,
  CHECK (`value` between 1 and 5)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `poem_ratings_poem_voter_unique` ON `poem_ratings` (`poem_id`, `voter_token_hash`);
--> statement-breakpoint
CREATE TABLE `poem_comments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `poem_id` integer NOT NULL,
  `pseudonym` text NOT NULL,
  `content` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `created_at` integer NOT NULL,
  `moderated_at` integer,
  FOREIGN KEY (`poem_id`) REFERENCES `poems`(`id`) ON DELETE CASCADE,
  CHECK (length(trim(`pseudonym`)) between 1 and 50),
  CHECK (length(trim(`content`)) between 1 and 500),
  CHECK (`status` in ('pending', 'approved'))
);
--> statement-breakpoint
CREATE INDEX `poem_comments_poem_status_created_idx` ON `poem_comments` (`poem_id`, `status`, `created_at`);
--> statement-breakpoint
CREATE INDEX `poem_comments_status_created_idx` ON `poem_comments` (`status`, `created_at`);
--> statement-breakpoint
CREATE TABLE `feedback_settings` (
  `id` integer PRIMARY KEY NOT NULL,
  `ratings_enabled` integer DEFAULT true NOT NULL,
  `comments_enabled` integer DEFAULT true NOT NULL,
  CHECK (`id` = 1)
);
--> statement-breakpoint
INSERT INTO `feedback_settings` (`id`, `ratings_enabled`, `comments_enabled`) VALUES (1, 1, 1);
