import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ListView from '../components/ListView';

const reactGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

reactGlobal.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function renderListView(items: string[]) {
  act(() => {
    root.render(<ListView title="언팔로워" items={items} accent="text-rose-500" />);
  });
}

function getButton(label: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (item) => item.textContent === label
  );
  if (!button) throw new Error(`Button not found: ${label}`);
  return button as HTMLButtonElement;
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
  vi.restoreAllMocks();
});

describe('ListView', () => {
  it('disables copy and CSV actions when there are no visible items', () => {
    renderListView([]);

    expect(getButton('필터 결과 복사').disabled).toBe(true);
    expect(getButton('CSV').disabled).toBe(true);
    expect(container.textContent).toContain('표시할 사용자가 없습니다.');
  });

  it('copies the filtered usernames and reports success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText }
    });

    renderListView(['zeta', 'alpha']);

    await act(async () => {
      getButton('필터 결과 복사').click();
    });

    expect(writeText).toHaveBeenCalledWith('alpha\nzeta');
    expect(container.textContent).toContain('복사됨');
  });

  it('shows a copy failure state when clipboard access fails', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) }
    });

    renderListView(['alpha']);

    await act(async () => {
      getButton('필터 결과 복사').click();
    });

    expect(container.textContent).toContain('복사 실패');
  });
});
