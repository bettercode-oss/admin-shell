# Architecture

## Grid Structure

```
grid-template-areas: "sidebar topbar" "sidebar content"
```

## CSS Variables

```
--admin-shell-sidebar-width
--admin-shell-topbar-height
--admin-shell-active-mix
```

(2단계에서 값만 바꾸면 접기/펼치기 — JS 리렌더 없음)

`--admin-shell-active-mix` 는 사이드바 활성 항목 배경을 `--sidebar-accent` 에서
`--sidebar-foreground` 쪽으로 얼마나 섞을지의 비율이다. 기본 3%.
`AdminShell` 이 선언하고 `SidebarNavItem` 이 `color-mix` 로 소비한다.

```tsx
<AdminShell style={{ "--admin-shell-active-mix": "2%" }}>
```

`SidebarNavItem` 쪽 참조에는 폴백(`var(--admin-shell-active-mix,3%)`)이 있다.
변수가 없으면 `color-mix` 선언 전체가 무효가 되어 활성 배경이 사라지는데,
`sidebar.tsx` 만 복사해간 프로젝트가 그 상황이기 때문이다.

## Component Tree

```
AdminShell
├── Sidebar (SidebarHeader / SidebarNav / SidebarNavItem / SidebarFooter)
├── Topbar (TopbarTitle / TopbarActions)
└── ShellContent (children, min-h-0 overflow-y-auto)
```

## 확장 시 주의점

- Sidebar/Topbar는 서버 컴포넌트로 유지 (상태 필요시 얇은 client Provider만 내부에 추가)
- 라우팅 비의존: Slot 기반 asChild 패턴으로 `<a>` / `<Link>` 주입은 소비자 책임
- 셸이 제공하는 아이콘 버튼은 아이콘을 `children` 기본값으로 둔다
  (상태별 표현은 `useShellState()` 를 쓰는 소비자 몫)
