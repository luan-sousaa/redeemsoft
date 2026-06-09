CREATE TABLE `contrato` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`candidaturaId` integer NOT NULL,
	`projetoId` integer NOT NULL,
	`empresaId` integer NOT NULL,
	`devId` integer NOT NULL,
	`valorProjeto` integer NOT NULL,
	`taxaPlataforma` integer NOT NULL,
	`valorTotal` integer NOT NULL,
	`statusPagamento` text NOT NULL DEFAULT 'pendente',
	`pixId` text,
	`confirmaEmpresa` integer NOT NULL DEFAULT 0,
	`confirmaDev` integer NOT NULL DEFAULT 0,
	`criadoEm` text NOT NULL DEFAULT (datetime('now')),
	`concluidoEm` text,
	FOREIGN KEY (`candidaturaId`) REFERENCES `aplicacao`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`projetoId`) REFERENCES `projeto`(`idProjeto`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`empresaId`) REFERENCES `cliente`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`devId`) REFERENCES `desenvolvedor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mensagem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contratoId` integer NOT NULL,
	`autorId` integer NOT NULL,
	`autorTipo` text NOT NULL,
	`texto` text NOT NULL,
	`criadoEm` text NOT NULL DEFAULT (datetime('now')),
	FOREIGN KEY (`contratoId`) REFERENCES `contrato`(`id`) ON UPDATE no action ON DELETE cascade
);
