ALTER TABLE `usuario` ADD COLUMN IF NOT EXISTS `resetToken` text;--> statement-breakpoint
ALTER TABLE `usuario` ADD COLUMN IF NOT EXISTS `resetTokenExpiry` integer;
