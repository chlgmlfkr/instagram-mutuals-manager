import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { InstagramExportAnalysisError, analyzeInstagramExport } from '../utils/analyzeInstagramExport';

function jsonFile(path: string, data: unknown) {
  const text = JSON.stringify(data);
  const file = new File([text], path.split('/').pop() ?? path, {
    type: 'application/json'
  });
  Object.defineProperty(file, 'text', {
    value: () => Promise.resolve(text)
  });
  return file;
}

function textFile(path: string, text: string) {
  const file = new File([text], path.split('/').pop() ?? path, {
    type: 'application/json'
  });
  Object.defineProperty(file, 'text', {
    value: () => Promise.resolve(text)
  });
  return file;
}

function withRelativePath(file: File, path: string) {
  Object.defineProperty(file, 'webkitRelativePath', {
    value: path
  });
  return file;
}

describe('analyzeInstagramExport', () => {
  it('supports folder-only analysis when zip input is missing', async () => {
    const folderFiles = [
      jsonFile('connections/followers_and_following/followers_1.json', [
        { string_list_data: [{ value: 'alice' }] }
      ]),
      jsonFile('connections/followers_and_following/following.json', [
        { string_list_data: [{ value: 'alice' }, { value: 'bob' }] }
      ])
    ];

    Object.defineProperty(folderFiles[0], 'webkitRelativePath', {
      value: 'export/connections/followers_and_following/followers_1.json'
    });
    Object.defineProperty(folderFiles[1], 'webkitRelativePath', {
      value: 'export/connections/followers_and_following/following.json'
    });

    const result = await analyzeInstagramExport(null, folderFiles);

    expect(result.stats.followersCount).toBe(1);
    expect(result.stats.followingCount).toBe(2);
    expect(result.results.mutuals).toEqual(['alice']);
    expect(result.results.unfollowers).toEqual(['bob']);
    expect(result.stats.sourceType).toBe('folder');
    expect(result.stats.sourceNote).toContain('폴더 업로드에서 파싱됨');
  });

  it('combines multipart relationship files from one export root', async () => {
    const zip = new JSZip();
    zip.file(
      'export/connections/followers_and_following/followers_1.json',
      JSON.stringify([{ string_list_data: [{ value: 'alice' }] }])
    );
    zip.file(
      'export/connections/followers_and_following/followers_2.json',
      JSON.stringify([{ string_list_data: [{ value: 'casey' }] }])
    );
    zip.file(
      'export/connections/followers_and_following/following_1.json',
      JSON.stringify([{ string_list_data: [{ value: 'alice' }] }])
    );
    zip.file(
      'export/connections/followers_and_following/following_2.json',
      JSON.stringify([{ string_list_data: [{ value: 'bob' }] }])
    );
    const content = await zip.generateAsync({ type: 'uint8array' });
    const zipFile = new File([content], 'export.zip', { type: 'application/zip' });

    const result = await analyzeInstagramExport(zipFile, []);

    expect(result.stats.followersCount).toBe(2);
    expect(result.stats.followingCount).toBe(2);
    expect(result.results.mutuals).toEqual(['alice']);
    expect(result.results.unfollowers).toEqual(['bob']);
    expect(result.results.fans).toEqual(['casey']);
    expect(result.stats.usedFollowersFiles).toEqual([
      'export/connections/followers_and_following/followers_1.json',
      'export/connections/followers_and_following/followers_2.json'
    ]);
  });

  it('includes blocked and restricted skips in stats', async () => {
    const folderFiles = [
      jsonFile('followers_1.json', [{ string_list_data: [{ value: 'alice' }] }]),
      jsonFile('following.json', [{ string_list_data: [{ value: 'alice' }] }]),
      jsonFile('blocked_profiles.json', [{ string_list_data: [{ href: 123 }] }]),
      jsonFile('restricted_profiles.json', [{ string_list_data: [{}] }])
    ];

    const result = await analyzeInstagramExport(null, folderFiles);

    expect(result.stats.skipCount).toBe(2);
  });

  it('exposes zip file list when required relationship files are missing', async () => {
    const zip = new JSZip();
    zip.file('connections/followers_and_following/profile.json', JSON.stringify({ name: 'alice' }));
    const content = await zip.generateAsync({ type: 'uint8array' });
    const zipFile = new File([content], 'export.zip', { type: 'application/zip' });

    await expect(analyzeInstagramExport(zipFile, [])).rejects.toMatchObject({
      name: 'InstagramExportAnalysisError',
      fileList: ['connections/followers_and_following/profile.json']
    } satisfies Partial<InstagramExportAnalysisError>);
  });

  it('exposes folder file list when required relationship files are missing', async () => {
    const folderFiles = [
      withRelativePath(
        jsonFile('profile.json', { name: 'alice' }),
        'export/connections/followers_and_following/profile.json'
      )
    ];

    await expect(analyzeInstagramExport(null, folderFiles)).rejects.toMatchObject({
      name: 'InstagramExportAnalysisError',
      fileList: ['export/connections/followers_and_following/profile.json']
    } satisfies Partial<InstagramExportAnalysisError>);
  });

  it('reports which selected file has invalid JSON', async () => {
    const folderFiles = [
      jsonFile('followers_1.json', [{ string_list_data: [{ value: 'alice' }] }]),
      textFile('following.json', '{not-json')
    ];

    await expect(analyzeInstagramExport(null, folderFiles)).rejects.toMatchObject({
      name: 'InstagramExportAnalysisError',
      message: 'JSON 파싱 실패: following.json',
      fileList: ['followers_1.json', 'following.json']
    } satisfies Partial<InstagramExportAnalysisError>);
  });
});
