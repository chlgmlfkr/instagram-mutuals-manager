import { describe, expect, it } from 'vitest';
import { setOps } from '../utils/setOps';

describe('setOps', () => {
  it('computes unfollowers, fans, mutuals with dedupe', () => {
    const result = setOps(['Alice', 'Bob'], ['bob', 'Casey', 'Casey']);

    expect(result.unfollowers).toEqual(['casey']);
    expect(result.fans).toEqual(['alice']);
    expect(result.mutuals).toEqual(['bob']);
  });
});
