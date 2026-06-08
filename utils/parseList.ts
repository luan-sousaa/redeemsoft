/**
 * Converte JSON string de array (ex: '["a","b"]') ou CSV para string[].
 * Usado em habilidades, certificações e outros campos armazenados como texto.
 */
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}
