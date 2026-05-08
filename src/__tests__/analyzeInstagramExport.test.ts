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
});
