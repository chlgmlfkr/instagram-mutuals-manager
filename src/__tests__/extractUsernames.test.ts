import { describe, expect, it } from 'vitest';
import { extractUsernames } from '../utils/extractUsernames';

describe('extractUsernames', () => {
  it('extracts from string_list_data value', () => {
    const result = extractUsernames([
      { string_list_data: [{ value: 'Alice' }] }
    ]);
    expect(result.usernames).toEqual(['alice']);
    expect(result.skipCount).toBe(0);
  });

  it('extracts from href when value missing', () => {
    const result = extractUsernames([
      { string_list_data: [{ href: 'https://www.instagram.com/bob/' }] }
    ]);
    expect(result.usernames).toEqual(['bob']);
  });

  it('extracts username from instagram /_u/<username>/ links', () => {
    const result = extractUsernames([
      { string_list_data: [{ href: 'https://www.instagram.com/_u/casey/' }] }
    ]);
    expect(result.usernames).toEqual(['casey']);
  });

  it('extracts all usernames when string_list_data has multiple items', () => {
    const result = extractUsernames([
      {
        string_list_data: [
          { value: 'Alice' },
          { href: 'https://www.instagram.com/bob/' },
          { value: 'Casey' }
        ]
      }
    ]);
    expect(result.usernames).toEqual(['alice', 'bob', 'casey']);
    expect(result.skipCount).toBe(0);
  });

  it('falls back to scanning nested strings', () => {
    const result = extractUsernames([
      { meta: { link: 'https://instagram.com/casey' } }
    ]);
    expect(result.usernames).toEqual(['casey']);
  });

  it('extracts multiple usernames from nested fallback structure', () => {
    const result = extractUsernames([
      {
        relationships_following: [
          { href: 'https://instagram.com/alpha/' },
          { href: 'https://instagram.com/beta/' },
          { href: 'https://instagram.com/gamma/' }
        ]
      }
    ]);
    expect(result.usernames).toEqual(['alpha', 'beta', 'gamma']);
    expect(result.skipCount).toBe(0);
  });

  it('handles raw handle strings', () => {
    const result = extractUsernames([
      { note: '@delta' }
    ]);
    expect(result.usernames).toEqual(['delta']);
  });

  it('counts skips', () => {
    const result = extractUsernames([{ foo: 'not-a-handle with spaces' }]);
    expect(result.usernames).toEqual([]);
    expect(result.skipCount).toBe(1);
  });
});
