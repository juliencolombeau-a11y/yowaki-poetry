CREATE TABLE `feedback_comment_limits` (
  `voter_token_hash` text PRIMARY KEY NOT NULL,
  `last_comment_at` integer NOT NULL,
  `daily_start` integer NOT NULL,
  `daily_count` integer NOT NULL,
  CHECK (`daily_count` between 1 and 5)
);
--> statement-breakpoint
CREATE INDEX `feedback_comment_limits_last_comment_idx` ON `feedback_comment_limits` (`last_comment_at`);
