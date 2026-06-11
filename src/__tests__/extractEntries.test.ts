import { describe, expect, it } from 'vitest';
import { extractEntries } from '../utils/extractEntries';

describe('extractEntries', () => {
  it('keeps string_list_data objects as relationship entries', () => {
    const entries = extractEntries({
      relationships_following: [
        { string_list_data: [{ value: 'alice' }] },
        { string_list_data: [{ href: 'https://instagram.com/bob/' }] }
      ]
    });

    expect(entries).toEqual([
      { string_list_data: [{ value: 'alice' }] },
      { string_list_data: [{ href: 'https://instagram.com/bob/' }] }
    ]);
  });

  it('collects nested href objects when string_list_data is missing', () => {
    const entries = extractEntries({
      relationships_following: [
        { href: 'https://instagram.com/alpha/' },
        { href: 'https://instagram.com/beta/' },
        { profile: { href: 'https://instagram.com/gamma/' } }
      ]
    });

    expect(entries).toEqual([
      { href: 'https://instagram.com/alpha/' },
      { href: 'https://instagram.com/beta/' },
      { href: 'https://instagram.com/gamma/' }
    ]);
  });

  it('does not duplicate string_list_data child rows as fallback href entries', () => {
    const entries = extractEntries([
      { string_list_data: [{ href: 'https://instagram.com/casey/' }] }
    ]);

    expect(entries).toEqual([
      { string_list_data: [{ href: 'https://instagram.com/casey/' }] }
    ]);
  });
});
