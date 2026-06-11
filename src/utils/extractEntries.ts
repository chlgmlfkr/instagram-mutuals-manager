export function extractEntries(data: unknown): unknown[] {
  const entries: unknown[] = [];

  function walk(node: unknown, insideStringListData = false) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, insideStringListData));
      return;
    }

    const record = node as Record<string, unknown>;
    if (Array.isArray(record.string_list_data)) {
      entries.push(node);
    } else if (!insideStringListData && typeof record.href === 'string') {
      entries.push(node);
    }

    Object.entries(record).forEach(([key, value]) => {
      walk(value, insideStringListData || key === 'string_list_data');
    });
  }

  walk(data);
  return entries;
}
