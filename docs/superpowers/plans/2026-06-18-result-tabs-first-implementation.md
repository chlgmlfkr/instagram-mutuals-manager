# Result Tabs First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the completed-analysis relationship tabs and account list above metrics and graphs, then consolidate the temporary design spec into the main design document.

**Architecture:** This is a render-order change inside the existing React success state. `ResultsTabs` stays responsible for tabs and the active `ListView`; `GraphCandidateCards`, `GraphSection`, stat cards, and diagnostics keep their current behavior and move lower in the hierarchy. Documentation consolidation updates `DESIGN.md` as the durable source and removes the temporary spec file.

**Tech Stack:** React, TypeScript, Vite, Vitest, Tailwind CSS, Markdown docs.

---

### Task 1: Lock the Result Order in Smoke Tests

**Files:**
- Modify: `src/__tests__/AppSmoke.test.tsx`

- [ ] **Step 1: Add order assertions after successful analysis**

Update the existing successful folder-analysis smoke test to assert that `계정 목록` appears before supporting dashboard sections.

```ts
    const content = container.textContent ?? '';
    const fileIndex = content.indexOf('현재 분석 파일');
    const listIndex = content.indexOf('계정 목록');
    const metricHelpIndex = content.indexOf('전체 팔로잉');
    const candidateIndex = content.indexOf('시각화 후보');
    const graphIndex = content.indexOf('팔로우 관계 비율');
    const diagnosticsIndex = content.indexOf('분석에 사용된 파일');

    expect(fileIndex).toBeGreaterThanOrEqual(0);
    expect(listIndex).toBeGreaterThan(fileIndex);
    expect(metricHelpIndex).toBeGreaterThan(listIndex);
    expect(candidateIndex).toBeGreaterThan(metricHelpIndex);
    expect(graphIndex).toBeGreaterThan(candidateIndex);
    expect(diagnosticsIndex).toBeGreaterThan(graphIndex);
```

- [ ] **Step 2: Run the targeted smoke test and confirm it fails before implementation**

Run:

```bash
npm test -- --run src/__tests__/AppSmoke.test.tsx
```

Expected before implementation: FAIL because `계정 목록` currently appears after the graph sections.

### Task 2: Reorder the Success Screen Render Blocks

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Move `ResultsTabs` directly below the current analyzed file card**

Inside the `viewState === 'success'` branch, render `ResultsTabs` immediately after the current analyzed file card and before the metric-card grid.

```tsx
            <ResultsTabs
              following={results.following}
              followers={results.followers}
              mutuals={results.mutuals}
              unfollowers={results.unfollowers}
              fans={results.fans}
              blocked={results.blocked}
              restricted={results.restricted}
            />
```

- [ ] **Step 2: Keep summary and visualization sections below the list**

The remaining order should be:

```tsx
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              ...
            </section>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              ...
            </div>

            <GraphCandidateCards results={results} stats={stats} />
            <GraphSection results={results} stats={stats} />
            <UsedFilesPanel stats={stats} error={error} lastFileList={lastFileList} />
```

- [ ] **Step 3: Run the targeted smoke test**

Run:

```bash
npm test -- --run src/__tests__/AppSmoke.test.tsx
```

Expected after implementation: PASS.

### Task 3: Consolidate the Design Spec

**Files:**
- Modify: `DESIGN.md`
- Delete: `docs/superpowers/specs/2026-06-18-result-tabs-first-design.md`

- [ ] **Step 1: Add the durable result hierarchy to `DESIGN.md`**

Add a short section under product goals or information architecture that records:

```md
## Completed result hierarchy
- The completed analysis screen prioritizes direct account-list interaction over dashboard interpretation.
- Order: current analyzed file, relationship tabs/account list, metric cards, snapshot caveat, visualization candidates, relationship graphs, diagnostics.
- `ResultsTabs` owns the primary workflow: inspect unfollower candidates, search, select, copy, and export CSV.
- Graphs stay secondary until the list workflow is visible.
```

- [ ] **Step 2: Remove the temporary spec file**

Delete:

```bash
docs/superpowers/specs/2026-06-18-result-tabs-first-design.md
```

### Task 4: Verify the Whole Change

**Files:**
- No source modifications expected.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run verify
```

Expected: tests and production build pass.

- [ ] **Step 2: Inspect git diff**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the app test, app render order, design doc, plan file, and spec deletion are changed.
