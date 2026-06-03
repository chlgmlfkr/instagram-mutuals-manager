# Instagram 맞팔 탐지기

Instagram Accounts Center에서 받은 내보내기 파일을 브라우저에서 분석해 `팔로우`, `팔로워`, `맞팔`, `언팔로워`, `언팔로우`, `제한`, `차단` 목록을 보여주는 정적 웹앱입니다.

## 프로젝트 목표
- Instagram export ZIP 또는 압축 해제 폴더를 로컬에서 분석
- 서버 전송 없이 브라우저 안에서만 처리
- 실제 export 구조 차이를 어느 정도 흡수하는 파서 제공
- 이상 수치가 나오면 원본 ZIP 기준으로 바로 진단 가능한 도구 제공

## 디자인 벤치마킹과 차별화 방향
참고 사이트: [Toollyst](https://www.toollyst.com/)

Toollyst는 `언팔로워 체크`, Instagram JSON 다운로드 안내, 파일 첨부, 분석 버튼까지 제품 흐름이 이 프로젝트와 거의 같습니다. 결과 화면도 검은 배경, Instagram 아이콘, 인스타/스레드 탭, 최신순/오래된순 정렬, 사용자 ID와 팔로우 날짜 테이블 중심으로 매우 담백합니다. 그대로 따라가면 사용자는 같은 도구로 인식할 가능성이 높으므로, 벤치마킹은 "담백한 결과 화면"과 "Instagram스러운 톤"까지만 가져가고 차별점은 시각화와 확장성으로 잡습니다.

벤치마킹할 점:
- 과한 대시보드 장식보다 결과 테이블을 먼저 보여주는 담백함
- 검은 배경, Instagram 아이콘, 파란 링크, 얇은 구분선처럼 Instagram 사용 맥락과 가까운 톤
- 첫 사용자가 Instagram export를 어디서 받는지 바로 이해하는 단계형 안내
- PC/모바일 Chrome 등 호환 브라우저 안내를 분석 전에 명확히 보여주는 방식
- ZIP 파일을 넣고 분석하기까지의 짧은 흐름
- 탈퇴 계정, Instagram 정책 변경, export 누락처럼 결과가 틀려 보일 수 있는 이유를 미리 설명하는 톤

차별점:
- 단순 `언팔로워 체크`가 아니라 `팔로워`, `팔로우`, `맞팔`, `언팔로워`, `언팔로우`, `차단`, `제한`을 한 번에 검토하는 관계 분석 워크스페이스로 포지셔닝
- Toollyst가 표 중심이라면 이 프로젝트는 관계 분포, 오래된 팔로우, 탈퇴/삭제 계정, 차단/제한 비율 등 시각화로 차별화
- Instagram뿐 아니라 Threads, 차단/제한, 팔로우 날짜, 장기 미상호작용 같은 다른 export 데이터까지 확장 가능한 구조로 설계
- 결과가 이상할 때 "왜 이렇게 나왔는지" 확인할 수 있도록 사용 파일 경로, skip count, 원본 ZIP 진단 흐름을 전면에 둠
- ZIP뿐 아니라 압축 해제 폴더, multipart followers 파일, export 루트가 여러 개인 케이스까지 견고하게 처리
- 선택 복사, 선택 CSV, 검색, 빈 탭 숨김처럼 분석 이후 정리 작업을 빠르게 끝내는 운영형 UI 제공
- 개인정보 신뢰를 디자인 장식이 아니라 no-login, no-server, no-storage 원칙과 브라우저 로컬 처리 증거로 전달

디자인/제품 할 일:
- [ ] 첫 화면은 Toollyst처럼 더 담백하고 Instagram스러운 톤으로 낮출지, 현재 브랜드형 화면을 유지할지 내일 함께 결정
- [ ] 결과 화면은 Toollyst의 단순 테이블 밀도를 참고하되, 우리만의 관계 시각화 영역을 어디에 둘지 결정
- [ ] 시각화 후보 정리: 관계 분포, 팔로우 기간 히스토그램, 오래된 언팔로워, 삭제 계정 비율, 차단/제한 요약
- [ ] 확장 데이터 후보 정리: Threads 탭, 팔로우 날짜 기반 분석, 장기 미상호작용 추정, 차단/제한/삭제 계정 진단
- [ ] 다운로드 가이드를 더 시각적인 단계형 카드로 재구성하되, 본문이 길어져 업로드 CTA를 밀어내지 않게 조정
- [ ] 호환 브라우저 안내와 탈퇴/누락 계정 안내를 `DownloadGuide` 또는 분석 전 상태 패널에 추가
- [ ] "언팔로워"라는 단일 키워드 랜딩과 "맞팔 관계 워크스페이스"라는 차별 포지션 중 어느 쪽을 첫 화면 H1로 둘지 결정
- [ ] 분석 완료 화면에서 Toollyst와 다르게 시각화, 진단 정보, 사용 파일, 결과 신뢰도를 더 강하게 보여주는 레이아웃 설계
- [ ] 모바일 첫 화면에서 업로드 카드가 첫 viewport 안에 충분히 보이는지 실기기 기준으로 재검토
- [ ] `visual-ralph` 기준용 스크린샷 또는 레퍼런스 상태를 확정한 뒤 디자인 수정 루프 시작

## 핵심 원칙
- Instagram 로그인 불필요
- Instagram 공식 API 미사용
- 비공식 크롤링/private API 미사용
- 업로드 파일과 분석 결과를 서버로 전송하지 않음
- 사용자 데이터 저장 기능 비활성 상태 유지
- 분석은 브라우저 로컬 메모리에서만 수행

## 현재 기능
- ZIP 업로드 분석
- 압축 해제 폴더 업로드 분석
- `followers` / `following` / `blocked` / `restricted` 파일 자동 탐색
- `connections/followers_and_following/` 경로 우선 탐색
- 결과 탭에서 빈 항목 자동 숨김
- 사용자 검색, 복사, CSV 다운로드
- 제한/차단 목록 표시
- `ins/` 샘플 ZIP 기준 케이스 리포트 생성
- 특정 계정이 ZIP 원본에 실제 존재하는지 진단

## 분류 기준
- `팔로우`: 내가 팔로우 중인 계정
- `팔로워`: 나를 팔로우 중인 계정
- `맞팔`: 서로 팔로우 중인 계정
- `언팔로워`: 나는 상대를 팔로우하지만, 상대는 나를 팔로우하지 않는 상태
- `언팔로우`: 상대는 나를 팔로우하지만, 나는 상대를 팔로우하지 않는 상태
- `제한`: Instagram 내보내기에서 제한 계정으로 잡힌 상태
- `차단`: Instagram 내보내기에서 차단 계정으로 잡힌 상태

## 실행 방법
```bash
npm install
npm run dev
```

브라우저에서 Vite 로컬 주소로 접속하면 됩니다.

## 모바일 테스트
같은 Wi-Fi에 연결된 상태에서:

```bash
npm run dev:mobile
```

그다음 PC의 로컬 IP로 접속합니다.
- 예: `http://192.168.0.12:5173`
- macOS 로컬 IP 확인: `ipconfig getifaddr en0`

주의:
- 회사/학교 네트워크는 내부 접속이 막힐 수 있음
- 방화벽이 켜져 있으면 `node` 수신 허용 필요

## 빌드와 미리보기
```bash
npm run build
npm run preview
```

## 테스트
```bash
npm test -- --run
```

현재 테스트 범위:
- 사용자명 추출
- ZIP 파일 탐색
- 집합 연산
- fixture 기반 통합 테스트
- 폴더 단독 분석 회귀 테스트

## 지원하는 Instagram 내보내기 형태
우선적으로 아래 경로를 찾습니다.

```text
connections/followers_and_following/followers_1.json
connections/followers_and_following/followers.json
connections/followers_and_following/following.json
connections/followers_and_following/following_1.json
connections/followers_and_following/blocked_profiles.json
connections/followers_and_following/restricted_profiles.json
```

구조가 조금 달라도 파일명 패턴이 맞으면 탐색하도록 되어 있습니다.

## 핵심 로직
### 1. 파일 탐색
- `src/utils/scanZip.ts`
- followers/following/blocked/restricted 후보를 찾고 canonical 경로를 우선 선택

### 2. 엔트리 추출
- `src/utils/extractEntries.ts`
- JSON 구조가 달라도 재귀 순회로 `string_list_data` 노드를 수집

### 3. username 파싱
- `src/utils/extractUsernames.ts`
- `value` -> `href` -> fallback 순으로 추출
- `/_u/<username>/` 링크 대응
- Instagram 호스트만 허용하도록 URL 판별 강화

### 4. 관계 계산
- `src/utils/setOps.ts`
- 맞팔, 언팔로워, 언팔로우 계산

### 5. 분석 조립
- `src/utils/analyzeInstagramExport.ts`
- ZIP 분석과 폴더 분석을 하나의 반환 구조로 통합
- 분석에 실제 사용한 파일 목록과 skip 통계 제공

## 정확도가 의심될 때 점검 순서
1. `npm run inspect:user -- <아이디>`로 문제 계정을 확인
2. 원본 ZIP에 실제 존재하는지 먼저 확인
3. 존재하는데 분류가 틀리면 fixture로 추가
4. fixture를 기반으로 회귀 테스트 작성

MCP로 인스타를 직접 보며 하나씩 대조하는 방식은 시간이 많이 들고 재현성도 낮습니다. 이 프로젝트에서는 ZIP 원본 기준 진단과 fixture 테스트 축적이 더 좋은 방향입니다.

## `ins/` 샘플 분석 도구
`ins/` 폴더에 넣어둔 ZIP들을 기준으로 케이스 리포트를 생성할 수 있습니다.

```bash
npm run report:ins
```

생성 결과:
- `ins/CASE_REPORT.md`

기본 동작:
- 300MB 초과 ZIP은 메모리 보호를 위해 자동 스킵

대용량 ZIP까지 포함하려면:

```bash
INS_REPORT_MAX_SIZE_MB=2000 npm run report:ins
```

또는:

```bash
npm run report:ins -- --max-size-mb=2000
```

## 특정 계정 진단
```bash
npm run inspect:user -- nx.g0_x
```

이 명령은 `ins/` 폴더의 ZIP들을 순회하면서 아래를 보여줍니다.
- `followers` 원본에 있는지
- `following` 원본에 있는지
- `restricted` 원본에 있는지
- `blocked` 원본에 있는지
- 현재 로직 기준 최종 분류가 무엇인지

## 폴더 구조
```text
docs/
  project-log.md
  refactoring-2026-03-10.md
src/
  App.tsx
  components/
    Uploader.tsx
    ResultsTabs.tsx
    ListView.tsx
    DownloadGuide.tsx
    AnalysisStatusPanel.tsx
    AppHeader.tsx
    Sidebar.tsx
    UsedFilesPanel.tsx
  utils/
    analyzeInstagramExport.ts
    scanZip.ts
    loadJson.ts
    extractEntries.ts
    extractUsernames.ts
    setOps.ts
    exportCsv.ts
  types/
    analysis.ts
  __tests__/
scripts/
  generate-ins-report.mjs
  inspect-user-in-zips.mjs
ins/
  *.zip
  CASE_REPORT.md
```

정리 원칙:
- 루트에는 실행과 빌드에 직접 필요한 파일만 둡니다.
- 기록성 문서는 `docs/` 아래로 모읍니다.
- 실제 샘플 ZIP과 생성 리포트는 `ins/`에서만 관리합니다.

## 작업 체크리스트
코드 변경 후:
- `npm test -- --run`
- `npm run build`

이상 수치 발생 시:
- 상태 패널의 사용 파일 경로 확인
- `entries(followers, following)` 값 확인
- `inspect:user` 결과와 원본 JSON 구조 확인

## 배포
정적 사이트라 Vite 빌드 산출물(`dist/`)만 배포하면 됩니다.

GitHub Pages 또는 Cloudflare Pages에 바로 올릴 수 있습니다.
- Build command: `npm run build`
- Output directory: `dist`

### 배포 전
- [ ] `npm install`
- [ ] `npm run test -- --run`
- [ ] `npm run build`
- [ ] 모바일 실기기 점검(선택): `npm run dev:mobile`

### 배포 후
- [ ] ZIP 업로드/분석 정상
- [ ] 주요 탭 수치 확인
- [ ] CSV 다운로드 정상
- [ ] iPhone Safari / Android Chrome 접속 확인

## 한계
- 분석 결과는 Instagram 내보내기 시점의 스냅샷 기준입니다
- 현재 앱은 시점 비교 기능이 없어서 언제 맞팔이 바뀌었는지는 알 수 없습니다
- 계정명 변경, 내보내기 시점 차이, 누락된 export 항목 때문에 실제 앱 화면과 체감이 다를 수 있습니다

## 작업 로그
### 2026-05-08
- 상태 점검 결과 앱은 정상 동작 상태였음
  - 변경 전 `npm test -- --run`: 5개 테스트 파일, 23개 테스트 통과
  - 변경 전 `npm run build`: Vite 프로덕션 빌드 성공
- 핵심 파서/집합 연산보다 프로젝트 신뢰도와 UI 유지보수성이 먼저라고 판단
- 로컬 분석을 강조하는 앱이므로 외부 네트워크 요청 가능성을 먼저 제거하기로 결정
- `src/index.css`의 Google Fonts import 제거
- 시스템 폰트 스택으로 변경해 페이지 로드 시 폰트 CDN 요청이 생기지 않도록 정리
- `src/App.tsx`의 대형 JSX를 아래 컴포넌트로 분리
  - `src/components/AppHeader.tsx`
  - `src/components/Sidebar.tsx`
  - `src/components/AnalysisStatusPanel.tsx`
  - `src/components/UsedFilesPanel.tsx`
- `Design mode`, `드리블 스타일` 같은 제작/시안 중심 문구를 실제 사용자 기준 문구로 교체
- 결과 목록에서 빈 필터 상태일 때 `복사`, `CSV 다운로드` 버튼 비활성화
- 클립보드 복사 실패 시 `복사 실패` 상태가 보이도록 개선
- `ListView`의 복사 상태 복귀 타이머 cleanup 추가
- 첫 사용자가 바로 이해할 수 있도록 업로드 패널에 `1 파일 선택 → 2 분석 시작 → 3 결과 확인` 흐름 추가
- `분석 시작` 버튼을 업로드 패널 하단 중앙의 큰 CTA로 변경
- 큰 화면에서 앱이 더 넓은 영역을 쓰도록 최대 폭과 좌측 패널 폭을 확장
- 초기 파일 미선택 상태에서 버튼 문구가 `분석 중...`으로 보이던 문제 수정
- UI 회귀 테스트 추가
  - `src/__tests__/ListView.test.tsx`
  - `src/__tests__/AppSmoke.test.tsx`
- 개선 후 확인
  - `npm test -- --run`: 7개 테스트 파일, 27개 테스트 통과
  - `npm run build`: Vite 프로덕션 빌드 성공
  - 브라우저 확인: `http://127.0.0.1:5173/`에서 제목, 로컬 배지, 개인정보 문구 렌더 확인
- 다음에 고치면 좋은 것
  - 업로드 후 실제 분석 완료까지 이어지는 브라우저 기반 E2E 테스트 추가
  - 큰 ZIP 분석 중 취소 버튼 또는 진행 상태 세분화

### 2026-05-14
- 첫 진입 화면 단순화
  - 초기 화면에서 분석 상태, 파일 진단, 결과 미리보기 등 대시보드 정보를 숨김
  - 강한 코랄 레드 단색 테마를 적용해 사이트의 첫 인상을 명확하게 조정
  - 첫 화면에는 서비스 설명, ZIP/폴더 업로드, `분석 시작`, `가이드라인 및 안내사항` 버튼만 남김
  - 파일을 선택하거나 오류가 발생하면 기존 관리 대시보드로 전환되도록 흐름 유지
- 전체 리모델링 방향을 `DESIGN.md`에 정리
  - Operational Ledger: 반복 사용형 로컬 분석 대시보드
  - Linear/Vercel식 절제, Airtable식 데이터 조작, Intercom/Notion식 안내 톤을 이 앱에 맞게 압축
- deep-interview/ralplan식 범위 정리
  - 저장/이전 파일 비교와 `신규/변동` 표시는 이번 범위에서 제외
  - 브라우저 저장, 이전 export 비교, Instagram 자동 액션은 이번 범위 제외
- UI 리모델링
  - 가짜 브라우저 프레임과 장식 배경을 제거하고 앱형 워크스페이스로 평탄화
  - 분석 화면과 다운로드 가이드 화면을 분리
  - 좌측은 업로드/분석 시작/로컬 신뢰, 우측은 상태/진단/결과 목록으로 정리
  - 분석 완료 시 언팔로워 후보, 언팔로우, 맞팔, 해석 실패를 최상단 요약에 노출
  - 결과 탭 순서를 실제 작업 우선순위 기준으로 재정렬
  - 저장/이전 파일 비교가 없는 `신규/변동` 탭을 제거하고 현재 export 기준 관계 탭만 유지
- 사용성 개선
  - 결과 목록에 선택 체크박스, 필터 전체 선택/해제, 선택 항목 복사, 선택 항목 CSV를 추가
  - 목록 높이를 viewport 기반으로 확장해 데스크톱 공간 활용 개선
  - 잘못된 폴더 선택 시 선택 상태가 남아 분석 버튼이 활성화되던 문제 수정
- 분석 유틸 보강
  - 폴더 업로드 실패 시 선택 파일 목록을 에러에 포함
  - JSON 파싱 실패 시 실패한 파일명을 포함해 보고
- 검증 결과
  - `npm test -- --run`: 7개 테스트 파일, 30개 테스트 통과
  - `npm run build`: Vite 프로덕션 빌드 성공
  - Browser DOM 확인: 데스크톱 기본 viewport와 390px 모바일 viewport에서 주요 레이아웃/문구 확인

### 2026-03-05
- 프로젝트 방향 정리: Instagram export ZIP 기반의 로컬 분석 도구로 범위 확정
- 보안/운영 원칙 수립: 로그인 요구 금지, API 미사용, 서버 전송 금지
- 기본 분석 기능 구현: ZIP 업로드, followers/following 탐색, 관계 계산
- username 추출 전략 구성: `string_list_data.value`, `href`, fallback 문자열 스캔
- 결과 화면 구성: 검색, 정렬, 복사, CSV 다운로드, 사용 파일 경로 표시
- fixture 기반 테스트 체계 도입

### 2026-03-10
- `src/utils/analyzeInstagramExport.ts` 추가
- ZIP/폴더 분석 흐름을 별도 모듈로 분리
- `src/types/analysis.ts` 추가
- 상태, 통계, 결과 타입과 초기값을 공통화
- `src/App.tsx`를 화면 상태 전환 중심으로 정리
- `src/components/ResultsTabs.tsx`에서 불필요한 props 제거
- `src/components/ListView.tsx` 검색 필터를 대소문자 영향 없이 동작하도록 보정
- `.gitignore` 정리로 실데이터 ZIP, 빌드 산출물, 의존성 폴더 제외
- 검증 결과: `npm test -- --run` 17개 테스트 통과, `npm run build` 성공

### 2026-03-11
- 폴더만 선택해도 분석이 가능하도록 분석 진입 조건 수정
- `analyzeInstagramExport`가 ZIP 없이 폴더 입력만으로도 동작하도록 변경
- `skipCount`에 blocked/restricted 파싱 실패도 포함하도록 수정
- 드래그앤드롭 ZIP 판별을 대소문자 비의존으로 수정
- 비정상 호스트 문자열이 username으로 오탐되지 않도록 Instagram URL 판별 강화
- 회귀 테스트 추가: 폴더 단독 분석, skipCount 집계, 비정상 호스트 차단
- 검증 결과: `npm test -- --run` 20개 테스트 통과, `npm run build` 성공

### 2026-04-15
- Git 기준으로 보기에 더 깔끔하도록 문서 파일을 루트에서 `docs/`로 이동
- `PROJECT_LOG.md`를 `docs/project-log.md`로 이동
- `2026-03-10-리팩토링.md`를 `docs/refactoring-2026-03-10.md`로 이동
- `README.md`의 폴더 구조 설명을 현재 배치에 맞게 갱신
- 문서성 파일은 `docs/`, 실행 스크립트는 `scripts/`, 샘플 데이터는 `ins/`에 두는 기준을 명시
