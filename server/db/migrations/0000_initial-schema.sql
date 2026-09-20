CREATE TABLE `poems` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `legacy_id` integer,
  `document_order` integer NOT NULL,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `excerpt` text,
  `collection` text,
  `form` text,
  `stanza` text,
  `meter` text,
  `rhyme_scheme` text,
  `is_calligram` integer DEFAULT false NOT NULL,
  `content_type` text DEFAULT 'poem' NOT NULL,
  `creation_date` text,
  `notes` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `poems_legacy_id_unique` ON `poems` (`legacy_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `poems_document_order_unique` ON `poems` (`document_order`);
--> statement-breakpoint
CREATE INDEX `poems_title_idx` ON `poems` (`title`);
--> statement-breakpoint
CREATE INDEX `poems_collection_idx` ON `poems` (`collection`);
--> statement-breakpoint
CREATE INDEX `poems_form_idx` ON `poems` (`form`);
--> statement-breakpoint
CREATE INDEX `poems_meter_idx` ON `poems` (`meter`);
--> statement-breakpoint
CREATE INDEX `poems_calligram_idx` ON `poems` (`is_calligram`);
--> statement-breakpoint
CREATE TABLE `themes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `themes_name_unique` ON `themes` (`name`);
--> statement-breakpoint
CREATE TABLE `languages` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `languages_name_unique` ON `languages` (`name`);
--> statement-breakpoint
CREATE TABLE `poem_themes` (
  `poem_id` integer NOT NULL,
  `theme_id` integer NOT NULL,
  PRIMARY KEY(`poem_id`, `theme_id`),
  FOREIGN KEY (`poem_id`) REFERENCES `poems`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `poem_languages` (
  `poem_id` integer NOT NULL,
  `language_id` integer NOT NULL,
  PRIMARY KEY(`poem_id`, `language_id`),
  FOREIGN KEY (`poem_id`) REFERENCES `poems`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `media` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `poem_id` integer NOT NULL,
  `kind` text NOT NULL,
  `cloudinary_public_id` text,
  `cloudinary_url` text NOT NULL,
  `mime_type` text NOT NULL,
  `original_filename` text,
  `size_bytes` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`poem_id`) REFERENCES `poems`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_poem_kind_unique` ON `media` (`poem_id`, `kind`);
--> statement-breakpoint
CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `password_hash` text NOT NULL,
  `role` text DEFAULT 'admin' NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
