export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    let parsed = JSON.parse(value);
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch {}
    }
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}
