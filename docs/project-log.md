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
