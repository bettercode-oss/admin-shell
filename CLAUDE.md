@AGENTS.md

## 작업 시작 전
- 셸 레이아웃을 건드리는 작업이면 ARCHITECTURE.md를 먼저 읽을 것

## 이 프로젝트의 원칙
- admin-shell은 순수 레이아웃/UI 컴포넌트 라이브러리다. 어떤 제품(KBO, dicpress 등)의
  데이터 모델이나 API 호출 코드도 여기 들어가면 안 된다.
- 모든 데이터는 props/콜백으로 주입받는다. fetch, DB 접근 코드 금지.
- 컴포넌트는 shadcn/ui 스타일(Tailwind + Radix 조합)로, 별도 CSS-in-JS 없이.
- src/app/page.tsx는 컴포넌트 프리뷰/데모 용도로만 쓴다.

## 구조
- src/components/admin-shell/ 에 컴포넌트
- 각 컴포넌트는 독립적으로 import해서 다른 프로젝트에 복사해갈 수 있어야 함
