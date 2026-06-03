import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

const reactGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

reactGlobal.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function jsonFile(path: string, data: unknown) {
  const text = JSON.stringify(data);
  const file = new File([text], path.split('/').pop() ?? path, {
    type: 'application/json'
  });
  Object.defineProperty(file, 'text', {
    value: () => Promise.resolve(text)
  });
  Object.defineProperty(file, 'webkitRelativePath', {
    value: path
  });
  return file;
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('App smoke flow', () => {
  it('renders the local privacy copy and switches to the download guide', () => {
    act(() => {
      root.render(<App />);
    });

    expect(container.textContent).toContain('서버 전송 없이 브라우저에서만 분석');
    expect(container.textContent).toContain('인스타 맞팔 관계를');
    expect(container.textContent).toContain('폴더 업로드');
    expect(container.textContent).toContain('분석 시작');
    expect(container.textContent).toContain('가이드라인 및 안내사항');
    expect(container.textContent).not.toContain('드리블 스타일');

    const guideButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '가이드라인 및 안내사항'
    );
    if (!guideButton) throw new Error('Guide tab button not found');

    act(() => {
      guideButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('내보내기 설정');
    expect(container.textContent).toContain('JSON (필수)');
  });

  it('rejects a folder without JSON files without enabling analysis', () => {
    act(() => {
      root.render(<App />);
    });

    const folderInput = Array.from(container.querySelectorAll('input[type="file"]')).find(
      (input) => input.getAttribute('aria-label') === '내보내기 폴더 선택'
    ) as HTMLInputElement | undefined;
    if (!folderInput) throw new Error('Folder input not found');

    const textFile = new File(['notes'], 'readme.txt', { type: 'text/plain' });
    Object.defineProperty(folderInput, 'files', {
      configurable: true,
      value: [textFile]
    });

    act(() => {
      folderInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('지원되지 않는 폴더입니다.');
    expect(container.textContent).toContain('선택된 폴더 없음');

    const analyzeButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '분석 시작'
    ) as HTMLButtonElement | undefined;
    if (!analyzeButton) throw new Error('Analyze button not found');
    expect(analyzeButton.disabled).toBe(true);
  });

  it('analyzes a selected folder and renders result counts and rows', async () => {
    act(() => {
      root.render(<App />);
    });

    const folderInput = Array.from(container.querySelectorAll('input[type="file"]')).find(
      (input) => input.getAttribute('aria-label') === '내보내기 폴더 선택'
    ) as HTMLInputElement | undefined;
    if (!folderInput) throw new Error('Folder input not found');

    Object.defineProperty(folderInput, 'files', {
      configurable: true,
      value: [
        jsonFile('export/connections/followers_and_following/followers_1.json', [
          { string_list_data: [{ value: 'alice' }] },
          { string_list_data: [{ value: 'casey' }] }
        ]),
        jsonFile('export/connections/followers_and_following/following.json', [
          { string_list_data: [{ value: 'alice' }] },
          { string_list_data: [{ value: 'bob' }] }
        ])
      ]
    });

    act(() => {
      folderInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const analyzeButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '분석 시작'
    ) as HTMLButtonElement | undefined;
    if (!analyzeButton) throw new Error('Analyze button not found');

    await act(async () => {
      analyzeButton.click();
    });

    expect(container.textContent).toContain('분석 결과 요약');
    expect(container.textContent).toContain('언팔로워 후보');
    expect(container.textContent).toContain('맞팔');
    expect(container.textContent).toContain('@bob');
    expect(container.textContent).not.toContain('신규/변동');
  });

  it('clears the previous ZIP selection when a rejected ZIP drop occurs', () => {
    act(() => {
      root.render(<App />);
    });

    const zipInput = Array.from(container.querySelectorAll('input[type="file"]')).find(
      (input) => input.getAttribute('aria-label') === 'ZIP 파일 선택'
    ) as HTMLInputElement | undefined;
    if (!zipInput) throw new Error('ZIP input not found');

    const validZip = new File(['zip'], 'export.zip', { type: 'application/zip' });
    Object.defineProperty(zipInput, 'files', {
      configurable: true,
      value: [validZip]
    });

    act(() => {
      zipInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('export.zip');

    const dropZone = Array.from(container.querySelectorAll('[aria-label="ZIP 파일 드롭 영역"]')).at(0);
    if (!dropZone) throw new Error('ZIP drop zone not found');

    const rejectedDrop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(rejectedDrop, 'dataTransfer', {
      value: {
        files: [new File(['notes'], 'notes.txt', { type: 'text/plain' })]
      }
    });

    act(() => {
      dropZone.dispatchEvent(rejectedDrop);
    });

    expect(container.textContent).toContain('ZIP 파일만 업로드할 수 있습니다.');
    expect(container.textContent).toContain('선택된 ZIP 없음');

    const analyzeButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '분석 시작'
    ) as HTMLButtonElement | undefined;
    if (!analyzeButton) throw new Error('Analyze button not found');
    expect(analyzeButton.disabled).toBe(true);
  });
});
