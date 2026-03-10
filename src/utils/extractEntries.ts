export function extractEntries(data: unknown): unknown[] {
  const entries: unknown[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    const record = node as Record<string, unknown>;
    if (Array.isArray(record.string_list_data)) {
      entries.push(node);
    }

    Object.values(record).forEach(walk);
  }

  walk(data);
  return entries;
}
