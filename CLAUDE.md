@AGENTS.md

## 이 프로젝트의 원칙
- admin-shell은 순수 레이아웃/UI 컴포넌트 라이브러리다. 어떤 제품(KBO, dicpress 등)의
  데이터 모델이나 API 호출 코드도 여기 들어가면 안 된다.
- 모든 데이터는 props/콜백으로 주입받는다. fetch, DB 접근 코드 금지.
- 컴포넌트는 shadcn/ui 스타일(Tailwind + Radix 조합)로, 별도 CSS-in-JS 없이.
- src/app/page.tsx는 컴포넌트 프리뷰/데모 용도로만 쓴다.

## 구조
- src/components/admin-shell/ 에 컴포넌트
- 복사 단위는 이 폴더 전체다. 파일끼리 서로 참조하므로 하나만 떼어가면 컴파일되지 않는다
  (Sidebar/Topbar를 서버 컴포넌트로 유지하려고 상태·포털이 필요한 조각을 클라이언트
  파일로 나눈 결과다). 함께 필요한 shadcn 컴포넌트와 토큰은 README의 "복사해서 쓰기" 참조
- 예외로 shell-context.tsx, sidebar-styles.ts, topbar.tsx는 같은 폴더의 다른 파일을 참조하지
  않아 단독으로 떼어갈 수 있다 (topbar.tsx 는 cn() 과 radix-ui Slot 이 필요하다)

## 작업 시작 전
- 셸 레이아웃을 건드리는 작업이면 ARCHITECTURE.md를 먼저 읽을 것

## 문서 갱신 원칙
세 문서는 독자가 다르므로 갱신 조건도 다르다. ARCHITECTURE.md는 셸을 고치는 사람,
README는 셸을 쓰기 시작하는 사람, CHANGELOG.md는 이미 쓰고 있고 갱신하려는 사람을
위한 것이다.

- 컴포넌트 구조나 동작 방식이 바뀌면 ARCHITECTURE.md도 같은 PR 또는 후속 PR에서 갱신한다
- 공개 API가 바뀌면 README도 같은 PR에서 갱신한다 — export하는 컴포넌트·훅의 추가/삭제,
  props, CSS 변수, 복사할 때 필요한 파일이나 shadcn 컴포넌트가 여기 해당한다
- 공개 API 나 의존이 바뀌면 CHANGELOG.md 도 같은 PR에서 갱신한다 — 재복사하는 소비자가
  덮기 전에 읽는 문서다. README와 대상이 겹치지만 독자의 질문이 다르다. README는
  "어떻게 쓰나", CHANGELOG는 "덮으면 뭐가 달라지나"
- 내부 구현만 바뀌고 공개 API가 그대로면 README도 CHANGELOG도 건드리지 않는다
- 갱신 시 문서의 서술과 실제 코드를 항목별로 대조해서 확인한다
