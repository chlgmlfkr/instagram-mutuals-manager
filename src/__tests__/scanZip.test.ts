import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { scanZip } from '../utils/scanZip';

describe('scanZip', () => {
  it('prefers canonical connections path even with top-level folder prefix', async () => {
    const zip = new JSZip();
    zip.file('export-root/connections/followers_and_following/followers_1.json', '[]');
    zip.file('export-root/connections/followers_and_following/following_1.json', '[]');
    zip.file('export-root/random/followers_2.json', '[]');

    const result = await scanZip(zip);

    expect(result.followersFiles).toEqual([
      'export-root/connections/followers_and_following/followers_1.json'
    ]);
    expect(result.followingFiles).toEqual([
      'export-root/connections/followers_and_following/following_1.json'
    ]);
  });

  it('falls back to followers.json and following.json', async () => {
    const zip = new JSZip();
    zip.file('your_instagram_activity/connections/followers_and_following/followers.json', '[]');
    zip.file('your_instagram_activity/connections/followers_and_following/following.json', '[]');

    const result = await scanZip(zip);

    expect(result.followersFiles).toEqual([
      'your_instagram_activity/connections/followers_and_following/followers.json'
    ]);
    expect(result.followingFiles).toEqual([
      'your_instagram_activity/connections/followers_and_following/following.json'
    ]);
  });

  it('returns empty arrays when neither followers nor following files exist', async () => {
    const zip = new JSZip();
    zip.file('your_instagram_activity/messages/inbox/thread/message_1.json', '[]');

    const result = await scanZip(zip);

    expect(result.followersFiles).toEqual([]);
    expect(result.followingFiles).toEqual([]);
  });

  it('finds blocked and restricted files', async () => {
    const zip = new JSZip();
    zip.file('connections/followers_and_following/blocked_profiles.json', '[]');
    zip.file('connections/followers_and_following/restricted_profiles.json', '[]');
    zip.file('connections/followers_and_following/followers_1.json', '[]');
    zip.file('connections/followers_and_following/following.json', '[]');

    const result = await scanZip(zip);

    expect(result.blockedFiles).toEqual([
      'connections/followers_and_following/blocked_profiles.json'
    ]);
    expect(result.restrictedFiles).toEqual([
      'connections/followers_and_following/restricted_profiles.json'
    ]);
  });

  it('ignores files that only contain following in the name', async () => {
    const zip = new JSZip();
    zip.file('connections/followers_and_following/following_hashtags.json', '[]');
    zip.file('connections/followers_and_following/following.json', '[]');
    zip.file('connections/followers_and_following/followers_1.json', '[]');

    const result = await scanZip(zip);

    expect(result.followingFiles).toEqual(['connections/followers_and_following/following.json']);
  });
});
