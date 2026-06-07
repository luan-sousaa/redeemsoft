import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

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

});

export const cliente = sqliteTable("cliente",{
  idCliente: integer("id").primaryKey({autoIncrement:true}).notNull(),
  idUsuario: integer("idUsuario")
    .notNull()
    .references(() => usuario.idUsuario),
  empresa: text("empresa"),
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