CREATE TABLE IF NOT EXISTS `notificacao` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `idUsuario` INTEGER NOT NULL,
  `tipo` TEXT NOT NULL,
  `titulo` TEXT NOT NULL,
  `corpo` TEXT NOT NULL,
  `lida` INTEGER DEFAULT 0 NOT NULL,
  `criadoEm` TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE no action
);
