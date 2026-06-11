import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ResultsTabs from '../components/ResultsTabs';

const reactGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

reactGlobal.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function renderResultsTabs() {
  act(() => {
    root.render(
      <ResultsTabs
        following={['alice', 'bob']}
        followers={['alice', 'casey']}
        mutuals={['alice']}
        unfollowers={['bob']}
        fans={['casey']}
        blocked={[]}
        restricted={[]}
      />
    );
  });
}

function clickButton(label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) =>
    item.textContent?.startsWith(label)
  );
  if (!button) throw new Error(`Button not found: ${label}`);
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
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

describe('ResultsTabs', () => {
  it('maps relationship labels to the correct result rows', () => {
    renderResultsTabs();

    expect(container.textContent).toContain('언팔로워 후보');
    expect(container.textContent).toContain('@bob');
    expect(container.textContent).not.toContain('@casey');

    clickButton('나를 팔로우함');
    expect(container.textContent).toContain('@casey');
    expect(container.textContent).not.toContain('@bob');

    clickButton('맞팔');
    expect(container.textContent).toContain('@alice');
    expect(container.textContent).not.toContain('@bob');
    expect(container.textContent).not.toContain('@casey');
  });
});
