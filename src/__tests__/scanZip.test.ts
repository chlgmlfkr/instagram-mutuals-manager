import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { scanFolderFiles, scanZip } from '../utils/scanZip';

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

  it('does not merge relationship files from multiple export roots', async () => {
    const zip = new JSZip();
    zip.file('export-a/connections/followers_and_following/followers_1.json', '[]');
    zip.file('export-a/connections/followers_and_following/following.json', '[]');
    zip.file('export-b/connections/followers_and_following/followers_1.json', '[]');
    zip.file('export-b/connections/followers_and_following/following.json', '[]');

    const result = await scanZip(zip);

    expect(result.followersFiles).toEqual([
      'export-a/connections/followers_and_following/followers_1.json'
    ]);
    expect(result.followingFiles).toEqual([
      'export-a/connections/followers_and_following/following.json'
    ]);
  });

  it('scores canonical relationship paths case-insensitively', async () => {
    const zip = new JSZip();
    zip.file('export/Connections/Followers_And_Following/followers_1.json', '[]');
    zip.file('export/Connections/Followers_And_Following/following.json', '[]');
    zip.file('export/random/followers_1.json', '[]');
    zip.file('export/random/following.json', '[]');

    const result = await scanZip(zip);

    expect(result.followersFiles).toEqual([
      'export/Connections/Followers_And_Following/followers_1.json'
    ]);
    expect(result.followingFiles).toEqual([
      'export/Connections/Followers_And_Following/following.json'
    ]);
  });

  it('keeps folder uploads scoped to one export root', () => {
    const files = [
      new File(['[]'], 'followers_1.json', { type: 'application/json' }),
      new File(['[]'], 'following.json', { type: 'application/json' }),
      new File(['[]'], 'followers_1.json', { type: 'application/json' }),
      new File(['[]'], 'following.json', { type: 'application/json' }),
      new File(['[]'], 'blocked_profiles.json', { type: 'application/json' })
    ];
    [
      'export-a/connections/followers_and_following/followers_1.json',
      'export-a/connections/followers_and_following/following.json',
      'export-b/connections/followers_and_following/followers_1.json',
      'export-b/connections/followers_and_following/following.json',
      'export-b/connections/followers_and_following/blocked_profiles.json'
    ].forEach((path, index) => {
      Object.defineProperty(files[index], 'webkitRelativePath', { value: path });
    });

    const result = scanFolderFiles(files);

    expect(result.followersFiles.map((file) => file.webkitRelativePath)).toEqual([
      'export-a/connections/followers_and_following/followers_1.json'
    ]);
    expect(result.followingFiles.map((file) => file.webkitRelativePath)).toEqual([
      'export-a/connections/followers_and_following/following.json'
    ]);
    expect(result.blockedFiles).toEqual([]);
  });
});
