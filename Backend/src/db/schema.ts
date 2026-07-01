import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Adicionado: resetToken e resetTokenExpiry para o fluxo de recuperação de senha.
export const usuario = sqliteTable("usuario",{

  idUsuario: integer("id").primaryKey({autoIncrement:true}).notNull(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  senha: text("senha").notNull(),
  type: text("type", { enum: ["client", "developer"] }).notNull(),
  cidade: text("cidade"),
  estado: text("estado"),
  cpfCnpj: text("cpfCnpj"),
  resetToken: text("resetToken"),
  resetTokenExpiry: integer("resetTokenExpiry"),
});

export const desenvolvedor = sqliteTable("desenvolvedor",{
  idDev: integer("id").primaryKey({autoIncrement:true}).notNull(),
  idUsuario: integer("idUsuario")
    .notNull()
    .references(() => usuario.idUsuario),
  precoPorHora: real("preco"),
  sobreMim: text("sobreMim"),
  habilidades: text("habilidades"),
  certificacoes: text("certificacoes"),
  experiencia: text("experiencia"),
  foto: text("foto"),
  projetos: text("projetos"), // JSON: [{id, titulo, stack, foto}]
});

export const cliente = sqliteTable("cliente",{
  idCliente: integer("id").primaryKey({autoIncrement:true}).notNull(),
  idUsuario: integer("idUsuario")
    .notNull()
    .references(() => usuario.idUsuario),
  empresa: text("empresa"),
  descricao: text("descricao"),
  segmento: text("segmento"),
  tamanho: text("tamanho"),
  site: text("site"),
  anoFundacao: text("anoFundacao"),
  cidade: text("cidade"),
  estado: text("estado"),
  modalidadePreferida: text("modalidadePreferida"),
});


export const aplicacao = sqliteTable("aplicacao",{
  idAplicacao: integer("id").primaryKey({autoIncrement:true}).notNull(),
  idDev: integer("idDev")
    .notNull()
    .references(() => desenvolvedor.idDev, { onDelete: "cascade" }),

  idProjeto: integer("idProjeto")
    .notNull()
    .references(() => novoProjeto.idProjeto, { onDelete: "cascade" }),

  proposta: real("proposta"),
  status: text("status", { enum: ["pendente", "aceito", "recusado"] }).notNull(),
})

export const novoProjeto = sqliteTable("projeto",{
  idProjeto: integer("idProjeto").primaryKey({autoIncrement:true}).notNull(),
  idCliente: integer("idCliente")
    .notNull()
    .references(() => cliente.idCliente, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  descricao: text("descricao").notNull(),
  orcamento: real("orcamento").notNull(),
  prazo: integer("prazo").notNull(),
  modalidade: text("modalidade", { enum: ["presencial", "remoto", "híbrido"] }).notNull(),
  stack: text("stack").notNull(),

  status: text("status", { enum: ["ativo", "em_andamento", "concluido"] })
    .notNull()
    .default("ativo"),

  dataCriacao: integer("dataCriacao", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
})

// ─── Contrato — escrow entre empresa e dev ───────────────────────────────────
export const contrato = sqliteTable("contrato", {
  idContrato: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  candidaturaId: integer("candidaturaId").notNull()
    .references(() => aplicacao.idAplicacao),
  projetoId: integer("projetoId").notNull()
    .references(() => novoProjeto.idProjeto),
  empresaId: integer("empresaId").notNull()
    .references(() => cliente.idCliente),
  devId: integer("devId").notNull()
    .references(() => desenvolvedor.idDev),
  valorProjeto:   integer("valorProjeto").notNull(),
  taxaPlataforma: integer("taxaPlataforma").notNull(),
  valorTotal:     integer("valorTotal").notNull(),
  statusPagamento: text("statusPagamento", {
    enum: ["pendente", "retido", "liberado", "cancelado"],
  }).notNull().default("pendente"),
  pixId:          text("pixId"),
  confirmaEmpresa: integer("confirmaEmpresa").notNull().default(0),
  confirmaDev:     integer("confirmaDev").notNull().default(0),
  criadoEm:   text("criadoEm").notNull().default(sql`(datetime('now'))`),
  concluidoEm: text("concluidoEm"),
});

// ─── Mensagem — chat entre empresa e dev após pagamento retido ───────────────
export const mensagem = sqliteTable("mensagem", {
  idMensagem: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  contratoId: integer("contratoId").notNull()
    .references(() => contrato.idContrato, { onDelete: "cascade" }),
  autorId:   integer("autorId").notNull(),
  autorTipo: text("autorTipo", { enum: ["empresa", "dev"] }).notNull(),
  texto:     text("texto").notNull(),
  lida:      integer("lida").notNull().default(0),
  criadoEm:  text("criadoEm").notNull().default(sql`(datetime('now'))`),
});

// ─── Notificação ─────────────────────────────────────────────────────────────
export const notificacao = sqliteTable("notificacao", {
  idNotificacao: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  idUsuario: integer("idUsuario").notNull()
    .references(() => usuario.idUsuario),
  tipo: text("tipo").notNull(), // nova_candidatura | candidatura_aceita | candidatura_recusada | novo_projeto
  titulo: text("titulo").notNull(),
  corpo: text("corpo").notNull(),
  lida: integer("lida").notNull().default(0),
  criadoEm: text("criadoEm").notNull().default(sql`(datetime('now'))`),
});
