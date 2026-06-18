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
  function openUploadFlow() {
    const startButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'ZIP으로 확인 시작하기'
    );
    if (!startButton) throw new Error('Start CTA not found');

    act(() => {
      startButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  }

  it('starts with a focused landing screen and switches to the download guide', () => {
    act(() => {
      root.render(<App />);
    });

    expect(container.textContent).toContain('브라우저 로컬 분석');
    expect(container.textContent).toContain('ISC');
    expect(container.textContent).toContain('홈');
    expect(container.textContent).toContain('분석화면');
    expect(container.textContent).toContain('개인정보 안내');
    expect(container.textContent).toContain('인스타 언팔로워');
    expect(container.textContent).toContain('ZIP으로 확인 시작하기');
    expect(container.textContent).toContain('다운로드 방법 보기');
    expect(container.textContent).toContain('Instagram 또는 Meta의 공식 서비스가 아닙니다.');
    expect(container.textContent).not.toContain('폴더 업로드');
    expect(container.textContent).not.toContain('분석 시작');
    expect(container.textContent).not.toContain('개인정보는 어떻게 처리되나요?');
    expect(container.textContent).not.toContain('드리블 스타일');

    const guideButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '다운로드 방법 보기'
    );
    if (!guideButton) throw new Error('Guide tab button not found');

    act(() => {
      guideButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('내보내기 설정');
    expect(container.textContent).toContain('JSON (필수)');
    expect(container.textContent).toContain('인스타그램 내보내기 ZIP 받는 방법');
    expect(container.querySelector('a[href="/instagram-export-guide.html"]')).not.toBeNull();
  });

  it('opens upload only after the primary CTA', () => {
    act(() => {
      root.render(<App />);
    });

    openUploadFlow();

    expect(container.querySelector('.page-turn')).not.toBeNull();
    expect(container.textContent).toContain('Instagram 내보내기 ZIP 선택');
    expect(container.textContent).toContain('다운로드한 ZIP 그대로 업로드');
    expect(container.textContent).toContain('압축 해제 폴더 업로드');
    expect(container.textContent).toContain('개인정보는 어떻게 처리되나요?');
    expect(container.textContent).not.toContain('분석 시작');
  });

  it('opens privacy as a first-class top navigation screen', () => {
    act(() => {
      root.render(<App />);
    });

    const privacyButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '개인정보 안내'
    );
    if (!privacyButton) throw new Error('Privacy tab button not found');

    act(() => {
      privacyButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('ISeeSocial 개인정보 안내');
    expect(container.textContent).toContain('결과 목록을 광고 코드나 통계 도구에 넘기지 않는 구조');
    expect(container.textContent).toContain('수집하지 않는 정보');
    expect(container.textContent).toContain('브라우저에서 처리되는 정보');
    expect(container.textContent).toContain('마지막 업데이트: 2026년 6월 11일');
    expect(container.querySelector('a[href="/privacy.html"]')).toBeNull();
  });

  it('rejects a folder without JSON files without enabling analysis', () => {
    act(() => {
      root.render(<App />);
    });

    openUploadFlow();

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
    expect(container.textContent).toContain('파일을 다시 확인해 주세요.');
    expect(container.textContent).toContain('다른 ZIP 선택');
  });

  it('shows a ready screen after ZIP selection before analysis', () => {
    act(() => {
      root.render(<App />);
    });

    openUploadFlow();

    const zipInput = Array.from(container.querySelectorAll('input[type="file"]')).find(
      (input) => input.getAttribute('aria-label') === 'ZIP 파일 선택'
    ) as HTMLInputElement | undefined;
    if (!zipInput) throw new Error('ZIP input not found');

    Object.defineProperty(zipInput, 'files', {
      configurable: true,
      value: [new File(['zip'], 'export.zip', { type: 'application/zip' })]
    });

    act(() => {
      zipInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('ZIP 선택 완료');
    expect(container.textContent).toContain('export.zip');
    expect(container.textContent).toContain('분석 시작');
    expect(container.textContent).not.toContain('계정 목록');
  });

  it('analyzes a selected folder and renders result counts and rows', async () => {
    act(() => {
      root.render(<App />);
    });

    openUploadFlow();

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

    expect(container.textContent).toContain('ZIP 선택 완료');

    const analyzeButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '분석 시작'
    ) as HTMLButtonElement | undefined;
    if (!analyzeButton) throw new Error('Analyze button not found');

    await act(async () => {
      analyzeButton.click();
    });

    expect(container.textContent).toContain('현재 분석 파일');
    expect(container.textContent).toContain('언팔로워 후보');
    expect(container.textContent).toContain('맞팔');
    expect(container.textContent).toContain('팔로우 관계 비율');
    expect(container.textContent).toContain('계정 목록');
    expect(container.textContent).toContain('@bob');
    expect(container.textContent).toContain('개인정보는 어떻게 처리되나요?');
    expect(container.textContent).not.toContain('관계 분석 보기');
    expect(container.textContent).not.toContain('신규/변동');
  });

  it('clears the previous ZIP selection when choosing another ZIP', () => {
    act(() => {
      root.render(<App />);
    });

    openUploadFlow();

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

    const resetButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '다른 ZIP 선택'
    );
    if (!resetButton) throw new Error('Reset button not found');

    act(() => {
      resetButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('선택된 ZIP 없음');
    expect(container.textContent).not.toContain('export.zip');
  });
});
