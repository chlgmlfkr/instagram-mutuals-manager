# Instagram 맞팔 탐지기

Instagram Accounts Center에서 받은 내보내기 파일을 브라우저에서 분석해 `팔로우`, `팔로워`, `맞팔`, `언팔로워`, `언팔로우`, `제한`, `차단` 목록을 보여주는 정적 웹앱입니다.

## 프로젝트 목표
- Instagram export ZIP 또는 압축 해제 폴더를 로컬에서 분석
- 서버 전송 없이 브라우저 안에서만 처리
- 실제 export 구조 차이를 어느 정도 흡수하는 파서 제공
- 이상 수치가 나오면 원본 ZIP 기준으로 바로 진단 가능한 도구 제공

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
    StatsCharts.tsx
    DownloadGuide.tsx
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
# instagram-mutuals-manager
