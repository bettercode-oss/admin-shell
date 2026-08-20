@AGENTS.md

## 이 프로젝트의 원칙
- admin-shell은 순수 레이아웃/UI 컴포넌트 라이브러리다. 어떤 제품(KBO, dicpress 등)의
  데이터 모델이나 API 호출 코드도 여기 들어가면 안 된다.
- 모든 데이터는 props/콜백으로 주입받는다. fetch, DB 접근 코드 금지.
- 컴포넌트는 shadcn/ui 스타일(Tailwind + Radix 조합)로, 별도 CSS-in-JS 없이.
- src/app/page.tsx는 컴포넌트 프리뷰/데모 용도로만 쓴다.

## 구조
- src/components/admin-shell/ 에 컴포넌트
- 각 컴포넌트는 독립적으로 import해서 다른 프로젝트에 복사해갈 수 있어야 함

## 작업 시작 전
- 셸 레이아웃을 건드리는 작업이면 ARCHITECTURE.md를 먼저 읽을 것

## 문서 갱신 원칙
두 문서는 독자가 다르므로 갱신 조건도 다르다. ARCHITECTURE.md는 셸을 고치는 사람,
README는 셸을 쓰는 사람을 위한 것이다.

- 컴포넌트 구조나 동작 방식이 바뀌면 ARCHITECTURE.md도 같은 PR 또는 후속 PR에서 갱신한다
- 공개 API가 바뀌면 README도 같은 PR에서 갱신한다 — export하는 컴포넌트·훅의 추가/삭제,
  props, CSS 변수, 복사할 때 필요한 파일이나 shadcn 컴포넌트가 여기 해당한다
- 내부 구현만 바뀌고 공개 API가 그대로면 README는 건드리지 않는다
- 갱신 시 문서의 서술과 실제 코드를 항목별로 대조해서 확인한다
