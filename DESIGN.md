# Design

## Source of truth
- Status: Active draft
- Last refreshed: 2026-06-18
- Primary product surfaces: first-run upload gate, analyze workspace, download guide, status summary, parsed-file diagnostics, relationship lists, CSV/copy actions.
- Evidence reviewed:
  - `README.md`: local-only Instagram export analyzer, no login/API/crawling, no server upload/storage, ZIP/folder support, result tabs, search/copy/CSV.
  - `docs/project-log.md`: browser-local privacy contract, parser diagnostics, fixture-driven reliability, operational checklist.
  - `src/App.tsx`: first-run brand gate, left workflow rail, right analysis surface, status/result sections.
  - `src/components/AppHeader.tsx`: workspace title, local dashboard framing, analyze/guide segmented navigation.
  - `src/components/Sidebar.tsx`: workflow menu, uploader/guide switch, privacy policy panel.
  - `src/components/Uploader.tsx`: three-step upload flow, ZIP/folder alternatives, local-only badge, primary analyze CTA.
  - `src/components/AnalysisStatusPanel.tsx`: status, counts, source type, parse quality, error state.
  - `src/components/ResultsTabs.tsx` and `src/components/ListView.tsx`: tabbed relationship ledger, search, sort, copy, CSV export.
  - `src/index.css` and `tailwind.config.js`: React + Vite + Tailwind, light mode, slate/white panels, warm amber/rose accents, high-radius card system, no external font import.
- External reference: getdesign.md, especially Apple, Cal.com, Airtable, Meta, Pinterest/Instagram red-accent patterns.

## Style candidates reviewed
- Linear: excellent precision, restrained accent use, dense product-tool credibility. Pure dark marketing canvas is rejected because this app is a repeated-use dashboard, not a developer-product landing page.
- Airtable: strong fit for structured data, friendly tables, filters, tabs, and record-like result lists. Full-color brand cards are rejected because relationship/privacy data should feel calm, not celebratory.
- Intercom: useful for approachable guidance and human microcopy. Chat-bubble personality is rejected because this app is not a support product.
- Notion: useful for quiet workspace affordances and document-like guidance. Illustration-heavy warmth is rejected because this app should foreground file analysis evidence.
- Vercel/Cal.com: useful for precise black/white controls, compact navigation, and production-grade restraint. Overly stark monochrome is rejected because Instagram export analysis benefits from warm privacy cues and risk states.

Chosen direction: **Private Export Console**. The product should feel like a private Instagram export analyzer, not an Instagram clone, growth tool, or red marketing hero. The style mix is Cal.com 40% for clean neutral tool surfaces, Apple 25% for premium white space and calm first impression, Airtable 20% for structured data lists and metrics, Meta 10% for trust-oriented blue CTAs, and Pinterest/Instagram red 5% for unfollower/risk emphasis only.

## Brand
- Personality: quiet, exact, local-first, privacy-literate, practical. It should read closer to Linear/Airtable operations software than to Instagram growth tooling.
- Trust signals: explicit local-only badges, used-file diagnostics, parser quality notes, clear disabled states, no login/API/crawling language, stable result counts, reversible export actions.
- Naming candidate:
  - Official product name: `ISeeSocial`.
  - Domain candidate: `isee.social` if available.
  - Korean alias: `아시셜`.
  - Rationale: "I see social" matches the product promise of inspecting user-owned social export data locally.
  - Risk: `아시셜` can sound like `asocial` in English, so use `ISeeSocial` as the official mark and `아시셜` as a Korean reading.
- Logo work:
  - ISeeSocial needs a dedicated logo before public launch. The current `ISC` square is acceptable as a temporary product mark only.
  - Primary direction: a restrained `IS` or `ISC` lettermark paired with the `ISeeSocial` wordmark.
  - The logo should feel like a private data utility: neutral, compact, trustworthy, and not like an Instagram clone or growth-hacking service.
  - Required deliverables: app header mark, favicon, Open Graph image lockup, dark/light safe variants, and a small monochrome fallback.
  - Avoid Instagram gradient imitation, camera glyph copying, follower-bait symbols, and overly playful mascot-style branding.
- Avoid:
  - Landing-page hero sections, marketing promises, influencer-growth language, vanity metrics, and dark cinematic SaaS drama.
  - Overly playful Instagram gradients as the main system. Warm accents are allowed, but relationship data must stay sober.
  - Decorative cards inside cards, oversized rounded shells, gradient-orb backgrounds, and vague AI-style copy.
  - UI that implies data is uploaded, stored, synced, or connected to Instagram.

## Product goals
- Goals:
  - Let users analyze Instagram export ZIP/folder files locally with minimum uncertainty.
  - Make `언팔로워 후보 확인` the first-session job; broader relationship analysis is secondary and optional.
  - Make the current input source, parse status, used files, skipped entries, and result categories obvious.
  - Support repeated inspection workflows: upload, analyze, verify, search, sort, copy, export CSV, rerun with another export.
  - Preserve user trust by making privacy constraints visible but not noisy.
- Non-goals:
  - No Instagram login, API integration, scraping, account automation, social growth coaching, cloud sync, or persisted profile history.
  - No marketing landing page as the primary surface.
  - No decorative visualization that weakens auditability.
- Success signals:
  - First-time users can identify the next action in under 5 seconds.
  - Done state shows `언팔로워 후보` before broader relationship analysis.
  - Returning users can compare counts, find a username, and export a category without reading instructions.
  - Errors explain what file/source failed and how to diagnose it.

## Completed result hierarchy
- The completed analysis screen prioritizes direct account-list interaction over dashboard interpretation.
- Render order: current analyzed file, relationship tabs/account list, metric cards, export-snapshot caveat, visualization candidates, relationship graphs, diagnostics.
- `ResultsTabs` owns the primary workflow: inspect unfollower candidates, search, select, copy, and export CSV.
- Metric cards and graph candidates are supporting interpretation, not the first completed-state task.
- Time-based charts remain out of scope until follow-date parsing is represented reliably in the analyzed result model.

## Product, launch, and monetization plan
- Current product order:
  1. `getdesign.md`-style design rules are consolidated in this file.
  2. First screen and result defaults focus on `언팔로워 후보 확인`.
  3. Result table, search, sort, copy, CSV, and diagnostics stay ahead of charts.
  4. Relationship analysis remains collapsed and optional until the user asks for it.
  5. Privacy, unofficial-service notice, and local-analysis copy must be visible before public launch.
- Differentiation from Toollyst:
  - Borrow the calm density and short upload flow.
  - Do not copy the black table, Instagram/Threads tab treatment, or ad-heavy result feel.
  - Differentiate through local trust, parser diagnostics, CSV/list operations, and optional relationship visualization.
- First deploy target:
  - Use Cloudflare Pages first.
  - Build command: `npm run build`.
  - Build output: `dist`.
  - Vercel is the second-choice fallback; GitHub Pages is acceptable only for a very basic static release.
- Public launch prerequisites:
  - `public/robots.txt`, `public/sitemap.xml`, Cloudflare Pages `_headers`/`_redirects`, and Open Graph metadata/image.
  - Privacy page or section that says files, filenames, usernames, raw export content, and result lists are not collected.
  - `Instagram/Meta 공식 서비스가 아님` notice in header/footer or guide/privacy surfaces.
  - Desktop and mobile smoke test with a real ZIP after preview deployment.
- Monetization sequence:
  1. Stabilize design and unfollower-first correctness.
  2. Add minimum relationship distribution visualization.
  3. Publish guide/content surfaces for export download, result interpretation, wrong-looking results, and privacy.
  4. Add ad placeholders only.
  5. Add real AdSense/Kakao AdFit scripts only after content, trust copy, and layout are stable.
- Allowed ad positions:
  - Guide top or bottom.
  - Result page bottom.
  - Desktop-only right auxiliary rail after the core result layout is stable.
- Forbidden ad positions:
  - Upload area, analyze button area, error/diagnostic messages, result table rows, and the gap between summary and first result table.
- SEO content targets:
  - `인스타 언팔로워 확인`.
  - `인스타 맞팔 확인`.
  - `인스타그램 내보내기`.
  - `인스타 데이터 다운로드`.
  - `인스타 팔로워 json`.

## Personas and jobs
- Primary personas:
  - Privacy-conscious Instagram users checking follow/follower relationships from official export data.
  - Maintainers debugging Instagram export format variations with fixtures and parser diagnostics.
  - Mobile users who need a quick read, with desktop users performing deeper CSV/list review.
- User jobs:
  - Upload official export ZIP or extracted folder.
  - Confirm the app is not sending data anywhere.
  - Understand relationship categories: following, followers, mutuals, unfollowers, fans, restricted, blocked.
  - Search or export a subset for offline review.
  - Diagnose suspicious counts by checking used files and skipped entries.
- Key contexts of use:
  - Browser-only local session, often with sensitive export ZIPs.
  - Intermittent, repeated utility usage rather than daily collaboration.
  - Korean-first UI copy with English technical labels used sparingly for file/source concepts.

## Information architecture
- Primary navigation:
  - Two top-level modes: `분석 화면` and `다운로드 가이드`.
  - Left rail owns workflow setup and privacy reassurance.
  - Main content owns analysis state, diagnostics, and results.
- Core routes/screens:
  - Single-page React app with stateful tabs instead of route-heavy navigation.
  - Analyze screen: uploader -> status summary -> used files -> relationship ledger.
  - Guide screen: export acquisition steps and local-analysis expectations.
- Content hierarchy:
  - Current task and status first.
  - Input source and local-only reassurance second.
  - In the completed result state, detailed relationship lists come before counts and charts.
  - Counts, parse quality, graph candidates, and relationship graphs support interpretation after the user can inspect accounts.
  - Diagnostics should remain available after the primary result workflow without interrupting the first account-list interaction.

## Design principles
- Principle 1: **Evidence before decoration.** Counts, source files, status labels, and errors are the visual anchors. Decorative surfaces must never compete with diagnostics.
- Principle 2: **Local-first trust is part of the interface.** Privacy claims should appear as compact badges, status copy, and file-handling notes near actions.
- Principle 3: **Dense but calm.** Prefer Airtable-like scannable tables, compact filters, and stable panel grids over large promotional sections.
- Principle 4: **One accent per meaning.** Slate/ink is default, amber means attention/processing/non-critical mismatch, rose means risk/error/unfollower or blocked-sensitive states, green only means verified success.
- Principle 5: **Repeat-use speed.** The upload, analyze, search, sort, copy, and CSV controls should remain predictable across runs.
- Tradeoffs:
  - Prefer clarity over brand spectacle.
  - Prefer explicit labels over hidden cleverness for privacy and export diagnostics.
  - Prefer small controls and high information density on desktop, but maintain 44px touch targets on mobile.

## Visual language
- Color:
  - Canvas: off-white `#f7f7f5` / `#fafafa`, with white cards for active work surfaces.
  - Ink: `#111827` for primary text, `#4b5563` for secondary, `#94a3b8` for metadata.
  - Borders: `#e5e7eb` for default hairlines, `#cbd5e1` for stronger separators.
  - Primary action: Meta-inspired blue `#2563eb`, hover `#1d4ed8`.
  - Risk/unfollower accent: Instagram/Pinterest red `#e1306c` or legacy coral `#d7372f`, only for unfollower/risk emphasis.
  - Attention: amber `#d97706` for non-critical parse warnings and "fans"/incoming-only states.
  - Privacy/success: restrained green `#16a34a` only when a process is complete or verified.
  - Avoid full-screen coral hero treatment, large saturated gradients, and Toollyst-like black table cloning.
- Typography:
  - Korean UI should use a locally available or self-hosted Korean sans such as `Pretendard` when assets are allowed.
  - Until font assets are added, keep the existing local/system stack to preserve the no-network privacy posture.
  - Use tabular numerals for counts where possible.
  - Use mono only for file paths, source labels, and diagnostic tokens.
  - No negative tracking. Existing uppercase eyebrows can keep positive tracking, but avoid overusing English section labels.
- Spacing/layout rhythm:
  - Use an 8px base rhythm.
  - Desktop: left workflow rail around 360-420px, main analysis area fluid.
  - Panels use 16-24px internal padding; dense list rows use 12-14px vertical padding.
  - Section gaps should be stable and modest; repeated dashboards should not require long scrolling before results.
- Shape/radius/elevation:
  - Primary pill CTAs may use full radius; utility buttons use 8px.
  - Cards and panels use 12px radius.
  - Data rows use 8px radius or square table rhythm.
  - Prefer hairline borders and subtle shadows over floating glossy cards.
- Motion:
  - Use short 120-180ms transitions for hover, focus, tab changes, and drag-over state.
  - Loading/parsing states may use a subtle progress shimmer or spinner, but no celebratory animation.
  - Respect `prefers-reduced-motion`.
- Imagery/iconography:
  - No stock imagery, influencer photos, or Instagram feed mockups.
  - Use simple functional icons when an icon library is introduced: upload, folder, shield, file, search, copy, download, alert, check.
  - Lettermark should shift from the temporary `ISC` mark to a deliberate `IS`/`ISC` logo system that matches `ISeeSocial`; do not overbrand it.

## Components
- Existing components to reuse:
  - `AppHeader`: product identity and mode switching.
  - `Sidebar`: workflow rail, uploader/guide switch, privacy policy.
  - `Uploader`: drag/drop, ZIP/folder input, analyze CTA.
  - `AnalysisStatusPanel`: status summary, source type, parse quality, errors.
  - `UsedFilesPanel`: diagnostics and source-file evidence.
  - `ResultsTabs`: category navigation with counts.
  - `ListView`: searchable/exportable relationship ledger.
- New/changed components:
  - `ExpandableAnalysis`: collapsed relationship analysis below the primary results table.
  - Future work may add a compact `TrustBadge`, `MetricCard`, `SourceFileRow`, and `EmptyState`, but only if duplication appears.
  - Do not add a separate design-system package for this small app.
- Variants and states:
  - Buttons: primary, secondary/outline, quiet icon button, danger only when destructive actions exist.
  - Inputs: default, hover, focus, disabled, invalid.
  - Upload area: idle, drag-over, selected, rejected, parsing.
  - Panels: default, highlighted attention, error, success.
  - Result rows: default, hover, copied/exported feedback, empty-filter state.
- Token/component ownership:
  - Tailwind utility classes remain the source of implementation truth for now.
  - Shared component classes in `src/index.css` should stay limited to durable primitives such as buttons.
  - If tokens expand, define them in Tailwind theme first, then consume via utilities.

## Accessibility
- Target standard: WCAG 2.1 AA for contrast, keyboard access, and status announcements.
- Keyboard/focus behavior:
  - All upload, analyze, tab, copy, CSV, search, and sort controls must be keyboard reachable.
  - Focus rings should be visible and not rely on color alone.
  - Tabs should expose selected state and preserve logical focus order.
- Contrast/readability:
  - Body text must meet AA on white/off-white surfaces.
  - Amber and rose text should be dark enough when used on pale backgrounds.
  - Placeholder text must not carry required instructions alone.
- Screen-reader semantics:
  - Status changes such as loading, parsing, done, and error should be announced through appropriate live-region treatment when implemented.
  - File inputs need explicit labels and supported file-type guidance.
  - Chart values must also be available as text.
- Reduced motion and sensory considerations:
  - Disable non-essential animation when `prefers-reduced-motion` is active.
  - Avoid blinking, pulsing, or countdown pressure.

## Responsive behavior
- Supported breakpoints/devices:
  - Mobile: 360-480px.
  - Tablet: 768-1024px.
  - Desktop: 1280px and wider.
  - Wide desktop: current max-width around 1880px is acceptable for dense review.
- Layout adaptations:
  - Desktop: two-column workspace with left workflow rail and right analysis area.
  - Tablet/mobile: stack rail above results; keep primary CTA visible after input selection.
  - Result tabs should horizontally scroll without hiding counts.
  - Data rows should avoid truncating usernames unless a copy/open action remains clear.
- Touch/hover differences:
  - Minimum touch target: 44px for buttons, tabs, file labels, and checkboxes.
  - Hover-only affordances must have visible default alternatives on touch.

## Interaction states
- Loading:
  - Show `ZIP 읽는 중...` and `데이터 파싱 중...` as distinct states.
  - Disable analyze CTA while parsing and preserve selected source summary.
- Empty:
  - Before input: show next-step instruction, not a blank dashboard.
  - After zero results in a category: explain that there are no users in the selected filter.
  - Empty search result: preserve total count and filtered count.
- Error:
  - Use rose text/background and plain language.
  - Explain whether the file type, folder contents, JSON parse, or expected path caused the issue when known.
  - Keep used-file/available-file diagnostics visible if available.
- Success:
  - Mark completion with restrained status treatment; do not use celebratory motion.
  - Show counts, source type, and result tabs immediately.
- Disabled:
  - Disabled controls should explain prerequisites through nearby text.
  - Do not style disabled buttons as active black controls.
- Offline/slow network:
  - The app should work without network after assets load.
  - Avoid remote fonts, analytics, embedded images, or external scripts by default.

## Content voice
- Tone: Korean-first, direct, calm, privacy-aware, operational.
- Terminology:
  - Use `맞팔`, `언팔로워 후보`, `나를 팔로우함`, `제한`, `차단` consistently.
  - Use `ZIP`, `Folder`, `JSON`, `CSV`, and file paths as technical nouns where clearer than translation.
  - Say `브라우저 로컬`, `서버로 전송하지 않습니다`, and `로그인 불필요` near relevant actions.
- Microcopy rules:
  - Prefer action-first labels: `ZIP 선택`, `폴더 선택`, `분석 시작`, `복사`, `CSV 다운로드`.
  - Avoid growth-hacking language such as "관리 성공", "팬 확보", "팔로워 늘리기".
  - Avoid overexplaining the UI in visible text. Use compact labels and only add guidance near ambiguous file workflows.

## Implementation constraints
- Framework/styling system:
  - React 18, Vite 5, TypeScript, Tailwind CSS.
  - No current router; preserve single-page flow unless a future requirement justifies routes.
  - No icon library currently installed; do not add dependencies solely for decoration.
- Design-token constraints:
  - Existing Tailwind extensions include ink, neon, magenta, and sunset tokens, but current UI mostly uses slate, amber, rose, and warm neutrals.
  - Before adding new tokens, consolidate around the Private Export Console palette above.
  - Keep `src/index.css` component classes limited to durable primitives.
- Performance constraints:
  - ZIP analysis may be memory-sensitive; do not add heavy visual libraries to the critical path.
  - Keep summary visuals lightweight and text-backed when they are reintroduced.
  - Avoid remote assets to protect privacy posture and offline reliability.
- Compatibility constraints:
  - Folder upload uses `webkitdirectory`; provide ZIP path as the reliable baseline.
  - Test mobile Safari/Android Chrome for upload, horizontal tabs, and CSV/copy behavior where possible.
- Test/screenshot expectations:
  - After UI changes, run `npm test -- --run` and `npm run build`.
  - For visual changes, capture desktop and mobile screenshots before claiming completion.
  - Preserve AppSmoke and ListView behavioral tests when changing component structure.

## Open questions
- [ ] What should the final ISeeSocial logo system be: `IS`, `ISC`, or full wordmark-first? Owner: product/design. Impact: favicon, header, OG image, and launch polish.
- [ ] Should the current browser-window outer chrome remain a durable brand metaphor, or should future iterations flatten it into a stricter SaaS workspace? Owner: product/design. Impact: layout density and visual maturity.
- [ ] Should the app self-host `Pretendard` or another Korean UI font, or keep the current no-extra-assets system stack? Owner: engineering/design. Impact: typography quality vs privacy/performance simplicity.
- [ ] Should relationship category names expose short explanatory tooltips for first-time users? Owner: product. Impact: learnability vs dashboard density.
- [ ] Should future diagnostics support manual file mapping when automatic export detection fails? Owner: product/engineering. Impact: advanced workflow scope and component complexity.
