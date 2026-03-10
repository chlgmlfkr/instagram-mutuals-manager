import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractEntries } from '../utils/extractEntries';
import { extractUsernames } from '../utils/extractUsernames';
import { setOps } from '../utils/setOps';

type Expected = {
  followers: number;
  following: number;
  mutuals: number;
  unfollowers: number;
  fans: number;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesRoot = path.join(__dirname, 'fixtures');

async function readJsonFixture(caseName: string, fileName: string) {
  const fullPath = path.join(
    fixturesRoot,
    caseName,
    'connections',
    'followers_and_following',
    fileName
  );
  const text = await readFile(fullPath, 'utf-8');
  return JSON.parse(text) as unknown;
}

async function runCase(caseName: string) {
  const followersJson = await readJsonFixture(caseName, 'followers_1.json');
  const followingJson = await readJsonFixture(caseName, 'following.json');

  const followersEntries = extractEntries(followersJson);
  const followingEntries = extractEntries(followingJson);

  const followers = Array.from(new Set(extractUsernames(followersEntries).usernames));
  const following = Array.from(new Set(extractUsernames(followingEntries).usernames));
  const ops = setOps(followers, following);

  return {
    followers,
    following,
    ops
  };
}

function assertCounts(result: Awaited<ReturnType<typeof runCase>>, expected: Expected) {
  expect(result.followers.length).toBe(expected.followers);
  expect(result.following.length).toBe(expected.following);
  expect(result.ops.mutuals.length).toBe(expected.mutuals);
  expect(result.ops.unfollowers.length).toBe(expected.unfollowers);
  expect(result.ops.fans.length).toBe(expected.fans);
}

describe('fixtures integration', () => {
  it('case_standard', async () => {
    const result = await runCase('case_standard');
    assertCounts(result, {
      followers: 3,
      following: 4,
      mutuals: 2,
      unfollowers: 2,
      fans: 1
    });
  });

  it('case_u_links', async () => {
    const result = await runCase('case_u_links');
    assertCounts(result, {
      followers: 2,
      following: 3,
      mutuals: 1,
      unfollowers: 2,
      fans: 1
    });
    expect(result.following).toContain('baz');
    expect(result.following).toContain('qux');
  });

  it('case_nested', async () => {
    const result = await runCase('case_nested');
    assertCounts(result, {
      followers: 2,
      following: 2,
      mutuals: 1,
      unfollowers: 1,
      fans: 1
    });
  });
});
