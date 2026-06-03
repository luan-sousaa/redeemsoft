CREATE TABLE `aplicacao` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idDev` integer NOT NULL,
	`idProjeto` integer NOT NULL,
	`proposta` real,
	`status` text NOT NULL,
	FOREIGN KEY (`idDev`) REFERENCES `desenvolvedor`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idProjeto`) REFERENCES `projeto`(`idProjeto`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cliente` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idUsuario` integer NOT NULL,
	`empresa` text,
	FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `desenvolvedor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idUsuario` integer NOT NULL,
	`preco` real,
	`sobreMim` text,
	`habilidades` text,
	`certificacoes` text,
	`experiencia` text,
	FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projeto` (
	`idProjeto` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idCliente` integer NOT NULL,
	`titulo` text NOT NULL,
	`descricao` text NOT NULL,
	`orcamento` real NOT NULL,
	`prazo` integer NOT NULL,
	`modalidade` text NOT NULL,
	`stack` text NOT NULL,
	`status` text DEFAULT 'ativo' NOT NULL,
	`dataCriacao` integer,
	FOREIGN KEY (`idCliente`) REFERENCES `cliente`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `usuario` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`email` text NOT NULL,
	`senha` text NOT NULL,
	`type` text NOT NULL,
	`cidade` text,
	`estado` text,
	`cpfCnpj` text
);
