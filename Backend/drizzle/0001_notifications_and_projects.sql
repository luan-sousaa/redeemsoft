ALTER TABLE `desenvolvedor` ADD COLUMN `foto` text;
--> statement-breakpoint
ALTER TABLE `desenvolvedor` ADD COLUMN `projetos` text;
--> statement-breakpoint
CREATE TABLE `notificacao` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`destinatarioId` integer NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text NOT NULL,
	`mensagem` text NOT NULL,
	`nomeEnvolvido` text NOT NULL,
	`lida` integer DEFAULT false NOT NULL,
	`criadaEm` integer,
	FOREIGN KEY (`destinatarioId`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE cascade
);
