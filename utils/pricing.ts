// REGRA DE NEGÓCIO — Taxa da plataforma RedeemSoft
// A plataforma cobra 10% do valor do contrato como taxa de intermediação.
// A empresa paga: valor do projeto + 10% de taxa.
// O desenvolvedor recebe: valor do projeto (sem desconto).
// A taxa só é cobrada quando o negócio é fechado (empresa aceita o dev
// e conclui o pagamento via PIX). Projetos sem candidato aceito não geram cobrança.

export const PLATFORM_FEE_PERCENT = 0.10

export function calcularValorTotal(valorProjeto: number): {
  valorProjeto: number
  taxaPlataforma: number
  valorTotal: number
  valorDev: number
} {
  const taxaPlataforma = Math.round(valorProjeto * PLATFORM_FEE_PERCENT)
  return {
    valorProjeto,
    taxaPlataforma,
    valorTotal: valorProjeto + taxaPlataforma,
    valorDev: valorProjeto,
  }
}

export function formatarBRL(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
