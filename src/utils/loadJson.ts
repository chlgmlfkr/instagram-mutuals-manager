import JSZip from 'jszip';

export async function loadJson<T = unknown>(zip: JSZip, path: string): Promise<T> {
  const file = zip.file(path);
  if (!file) {
    throw new Error(`파일을 찾을 수 없습니다: ${path}`);
  }
  const text = await file.async('string');
  return JSON.parse(text) as T;
}
