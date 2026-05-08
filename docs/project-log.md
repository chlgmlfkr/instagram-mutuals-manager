# Instagram 맞팔 탐지기 프로젝트 기록

작성일: 2026-03-05 (Asia/Seoul)

## 1) 프로젝트 목표
- Instagram export ZIP을 업로드해서 팔로우 관계를 분석하는 정적 웹앱
- 서버는 정적 파일 호스팅만 사용
- 모든 분석은 사용자 브라우저 로컬에서만 수행

## 2) 핵심 보안/운영 원칙 (지켜야 할 지침)
- Instagram 로그인 요구 금지
- Instagram 공식 API/비공식 private API 사용 금지
- 업로드 파일/분석 결과 서버 전송 금지
- 사용자 데이터 저장 금지 (기본: localStorage, IndexedDB 비활성)
- analytics 기본 비활성
- ZIP은 민감정보 포함 가능성이 있으므로 외부 공유 금지 안내 유지

## 3) 구현된 주요 기능
- ZIP 업로드 필수, 폴더 업로드 선택 지원
- ZIP 내부 `followers` / `following` 파일 자동 탐색
- `connections/followers_and_following/` 경로 우선 탐색
- 파일명 패턴 기반 fallback 탐색 (`followers*.json`, `following*.json`)
- `username` 추출 다중 전략
  - `string_list_data[].value`
  - `string_list_data[].href`
  - 객체 문자열 스캔 fallback
- URL 파싱 강화: `/_u/<username>/` 링크 대응
- 관계 계산 결과 제공
  - 팔로우
  - 팔로워
  - 내가 팔로우만
  - 상대가 팔로우만
  - 서로 팔로우
- 결과 탭별 검색, A-Z 정렬, 복사, CSV 다운로드
- 상태 패널에 실제 사용 파일 경로 표시
- 파싱 엔트리 수 표시 (`entries(followers:X, following:Y)`)

## 4) 핵심 로직 요약
### 4-1. 파일 탐색
- `src/utils/scanZip.ts`
- followers/following 파일 후보를 추출하고 우선순위 정렬

### 4-2. 엔트리 추출
- `src/utils/extractEntries.ts`
- JSON 구조가 달라도 재귀 순회로 `string_list_data` 보유 노드를 수집

### 4-3. username 파싱
- `src/utils/extractUsernames.ts`
- `value` -> `href` -> fallback 순으로 복원
- `_u` 링크에서 실제 username을 올바르게 추출하도록 보정

### 4-4. 집합 계산
- `src/utils/setOps.ts`
- Set 차집합/교집합
  - 내가 팔로우만 = following - followers
  - 상대가 팔로우만 = followers - following
  - 서로 팔로우 = intersection

## 5) 테스트 체계
- 단위 테스트
  - `extractUsernames`
  - `setOps`
  - `scanZip`
- fixture 통합 테스트
  - `src/__tests__/fixtures.integration.test.ts`
  - 케이스
    - 표준 포맷
    - `_u` 링크 포맷
    - 중첩 JSON 포맷
- 결과: 현재 테스트 모두 통과

## 6) 지금까지 진행한 개선 이력 (핵심)
1. 파일 탐색 규칙 확장 및 우선순위 정리
2. 잘못된 following 집계 원인 추적 및 파서 개선
3. `_u` 링크 파싱 버그 수정
4. 결과 탭 분류 명확화 및 맞팔 탭 재추가
5. 상태 패널 디버그 정보 강화(사용 파일/엔트리 수)
6. 폴더 업로드 UI 박스 정리
7. fixture 기반 회귀 테스트 도입

## 6-1) 2026-05-07 입력 상태/진단/파서 안정화 작업
### 배경
- 폴더 관찰 후 현재 기능은 테스트와 빌드가 통과하는 상태였지만, 실제 사용 중 헷갈릴 수 있는 상태 관리 문제가 남아 있었다.
- 특히 ZIP과 폴더를 동시에 선택했을 때 실제 분석 소스가 UI에 명확히 드러나지 않았고, 지원되지 않는 ZIP을 넣었을 때 ZIP 내부 파일 목록 진단이 성공 경로에서만 저장되는 구조였다.
- `string_list_data[].value`는 username 형식 검증 없이 결과에 들어가고 있어, 실제 export 변형이나 잘못된 JSON이 섞일 경우 잡음 문자열이 계정 목록으로 들어갈 수 있었다.

### 수정한 점
- `ParsedStats.sourceType`을 추가했다.
  - 값은 `zip`, `folder`, `none` 중 하나다.
  - 분석 완료 후 UI의 입력 소스 표시는 선택된 파일 상태가 아니라 실제 분석에 사용된 소스를 기준으로 표시한다.
- `InstagramExportAnalysisError`를 추가했다.
  - 일반 `Error` 대신 ZIP/폴더 진단에 필요한 `fileList`를 함께 담을 수 있다.
  - 지원되지 않는 ZIP 또는 폴더 오류가 발생해도 App에서 ZIP 내부 파일 일부를 표시할 수 있는 기반을 만들었다.
- ZIP과 폴더 입력을 상호 배타적으로 정리했다.
  - ZIP을 선택하면 기존 폴더 선택을 비운다.
  - 폴더를 선택하면 기존 ZIP 선택을 비운다.
  - 사용자가 어떤 입력을 분석하고 있는지 혼동하지 않도록 했다.
- 새 입력 선택 및 새 분석 시작 시 이전 결과를 초기화한다.
  - `results`, `stats`, `lastFileList`를 명확히 초기 상태로 되돌린다.
  - 오류 화면이나 상태 패널에 이전 분석 흔적이 섞이는 상황을 줄였다.
- username 정규화 로직을 `normalizeHandle()`로 공통화했다.
  - `value`, `href`, fallback 스캔 모두 같은 handle 형식 검증을 통과한다.
  - `@` prefix 제거, lowercase 변환, Instagram handle 패턴 검증을 한 곳에서 수행한다.
  - `value`가 잘못된 문자열이어도 `href`가 정상이라면 href에서 username을 복원하도록 했다.
- `ResultsTabs`의 `dataMap`을 `useMemo`로 감쌌다.
  - 렌더마다 새 객체가 만들어져 `visibleTabs` 계산이 매번 무효화되는 구조를 정리했다.
  - 사용자 기능 변화 없이 렌더 안정성을 높이는 수준으로 제한했다.

### 추가한 테스트
- 잘못된 `string_list_data.value`는 username으로 추출하지 않는 테스트를 추가했다.
- `value`가 잘못됐지만 `href`가 정상인 경우 href로 fallback하는 테스트를 추가했다.
- 폴더 분석 결과에서 `stats.sourceType`이 `folder`로 기록되는지 확인하는 테스트를 추가했다.

### 기대 효과
- 분석 실패 시 사용자가 ZIP 내부에 어떤 파일이 있었는지 더 쉽게 확인할 수 있다.
- ZIP/폴더 선택이 한 번에 하나만 유지되어 분석 대상이 명확해진다.
- 계정 목록에 공백이 포함된 문장 같은 잘못된 값이 섞일 가능성이 낮아진다.
- 결과 탭 계산이 의도대로 메모이즈되어 불필요한 재계산을 줄인다.

### 주의할 점
- `value` 검증이 강화되어, Instagram handle 형식이 아닌 값은 더 이상 결과에 포함되지 않는다.
- 만약 실제 export에서 Instagram handle 규칙 밖의 값이 정상 계정으로 들어오는 사례가 발견되면 fixture를 추가한 뒤 `normalizeHandle()` 정책을 다시 조정해야 한다.

## 7) 현재 남은 과제 / 다음 계획
- README를 포트폴리오/홍보형으로 개편
- 랜딩 섹션 카피/구조 고도화(동아리 홍보용)
- 수동 파일 선택 모드(자동 탐색 실패 시)
- 더 다양한 실제 변형 포맷 fixture 추가
- 배포 자동화(GitHub Actions) 및 데모 ZIP 세트 준비

## 8) 작업 시 체크리스트
- 코드 변경 후
  - `npm run test -- --run`
  - `npm run build`
- 이상 수치 발생 시
  - 상태 패널의 사용 파일 경로 확인
  - `entries(followers, following)` 값 확인
  - `following.json` 포맷 확인 후 parser 분기 보강

## 9) 참고 파일
- `src/App.tsx`
- `src/components/Uploader.tsx`
- `src/components/ResultsTabs.tsx`
- `src/components/ListView.tsx`
- `src/utils/scanZip.ts`
- `src/utils/extractEntries.ts`
- `src/utils/extractUsernames.ts`
- `src/utils/setOps.ts`
- `src/__tests__/fixtures.integration.test.ts`

## 10) 배포 체크리스트
### 10-1. 배포 전
- [ ] `npm install`
- [ ] `npm run test -- --run`
- [ ] `npm run build`
- [ ] 모바일 실기기 점검(선택): `npm run dev:mobile`

### 10-2. Cloudflare Pages (권장)
- [ ] Cloudflare Pages에서 GitHub repo 연결
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] 배포 URL 접속 확인

### 10-3. 배포 후 점검
- [ ] ZIP 업로드/분석 정상
- [ ] 탭 5개 수치 확인
- [ ] CSV 다운로드 정상
- [ ] iPhone Safari / Android Chrome 접속 확인

### 10-4. GitHub Pages (대안)
- [ ] `npm run build`
- [ ] `npx gh-pages -d dist`
- [ ] Settings -> Pages 에서 `gh-pages` 브랜치 연결
