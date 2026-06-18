# Result Tabs First Design

## Context

The current ISeeSocial result screen shows the analyzed file, metric cards, a caveat callout, visualization candidates, relationship charts, and then the account list tabs. The user wants the result tabs moved to the top of the completed analysis area because the core product promise is not "show charts first"; it is "let me inspect unfollower candidates immediately."

This spec covers only the completed analysis result screen after a ZIP or folder has been analyzed. It does not change the upload flow, privacy page, download guide, ad placeholders, parser logic, CSV export behavior, or loading animation sequence.

## Goal

Make the result screen prioritize direct account-list interaction.

Success means:

- The account relationship tabs appear near the top of the success screen, directly after the current analyzed file card.
- The default visible tab remains `언팔로워 후보`.
- The selected tab's account list appears before graph and visualization sections.
- Metrics and charts remain available, but they are secondary to the list workflow.
- The screen still explains that results are based on the Instagram export snapshot.

## Recommended Layout

Order the completed analysis screen as:

1. Current analyzed file card
2. Result tabs and active account list
3. Compact metric summary
4. Export-snapshot caveat
5. Visualization candidate section
6. Existing relationship graph section
7. Used files / diagnostics panel

This keeps the primary user action at the top: inspect the unfollower candidates, search, select, copy, or export CSV.

## Components

### `ResultsTabs`

Keep `ResultsTabs` as the owner of relationship tabs and the active `ListView`. Move the whole component above metric cards in the success screen.

No new tab system is needed. The existing component already provides:

- Default active tab: `unfollowers`
- Visible-tab filtering
- Tab counts
- Active list rendering
- Search, selection, copy, and CSV through `ListView`

### Metric Cards

Keep the four metric cards, but move them below `ResultsTabs`.

The cards remain useful as supporting summary:

- `언팔로워 후보`
- `맞팔`
- `나를 팔로우함`
- `읽지 못한 항목`

Do not duplicate these counts inside a second top summary strip for this pass. The tab count pills already expose the most important counts at the top.

### Visualization Sections

Keep `GraphCandidateCards` and `GraphSection`, but place both below the list workflow.

The graph candidate set remains:

1. `언팔로워 위험 비율`
2. `관계 구성 막대`
3. `맞팔 안정도`
4. `데이터 신뢰도`

These are good candidates because they use fields already produced by the local analyzer. Do not add time-based charts yet because stable follow-date parsing is not part of the current analyzed result model.

## Data Flow

No parser changes are required.

The success screen already has:

- `results.following`
- `results.followers`
- `results.mutuals`
- `results.unfollowers`
- `results.fans`
- `results.blocked`
- `results.restricted`
- `stats.skipCount`
- `lastFileList`

The implementation only reorders render blocks inside the `viewState === 'success'` branch.

## Error Handling

No error behavior changes are required.

The existing error screen remains separate from the success layout. If analysis fails, users should still see the error card and used-files diagnostics rather than tabs or charts.

## Testing

Update the app smoke test so it proves the new visual hierarchy:

- After analysis completes, `계정 목록` appears before `언팔로워 후보` metric-card help or graph text.
- `팔로우 관계 비율` appears after `계정 목록`.
- `시각화 후보` appears after the active list section.
- Existing checks for `@bob`, ad placeholders, and absence of the old `관계 분석 보기` text remain.

Run:

```bash
npm run verify
```

## Out of Scope

- Sticky tabs
- New chart library
- Time-series charts
- Follow-date parsing
- Real ad scripts
- Moving account tabs into the global header
- Changing upload or loading animations

## Rationale

The user's selected direction is `언팔로워 목록 바로 조작`. That means the result page should behave more like an operational tool than a dashboard. Charts should support interpretation after the user can already inspect the actual accounts.

This also keeps the product differentiated from Toollyst without copying its plain table-first layout: ISeeSocial still has richer metrics and visualization, but those elements no longer block the core unfollower workflow.
