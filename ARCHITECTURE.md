# Architecture

## Grid Structure

```
grid-template-areas: "sidebar topbar" "sidebar content"
```

## CSS Variables

```
--admin-shell-sidebar-width            펼친 폭, 기본 16rem
--admin-shell-sidebar-width-collapsed  접힌 폭, 기본 4rem
--admin-shell-topbar-height            기본 3.5rem
--admin-shell-active-mix               활성 항목 배경 혼합 비율, 기본 3%
```

### 접기는 폭 변수를 바꾸지 않는다

`--admin-shell-sidebar-width` 의 값을 바꾸는 방식이 아니다. 이 변수는 `AdminShell` 이
인라인 `style` 로 선언하는데, **인라인 style 은 클래스보다 항상 우선**하므로 클래스로
덮어쓸 수 없다. 그래서 접힘은 `grid-template-columns` 자체를 교체한다.

```
grid-cols-[var(--admin-shell-sidebar-width)_1fr]
data-collapsed:grid-cols-[var(--admin-shell-sidebar-width-collapsed)_1fr]
transition-[grid-template-columns] duration-200 ease-out
```

덕분에 `--admin-shell-sidebar-width` 는 "펼친 폭"이라는 의미를 유지하고, 소비자는
`style` 로 그대로 덮어쓸 수 있다. 상태가 바뀌면 `ShellRoot` 는 리렌더되지만 폭 전환
자체는 CSS transition 이 처리한다.

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
AdminShell                         TooltipProvider + ShellRoot(상태) + 그리드
├── Sidebar
│   ├── SidebarHeader
│   │   ├── SidebarHeaderTitle     접히면 숨는다
│   │   └── SidebarHeaderActions
│   │       └── SidebarCollapseToggle
│   ├── SidebarNav
│   │   └── SidebarNavItem         icon / active / tooltip / asChild
│   └── SidebarFooter
├── Topbar (TopbarTitle / TopbarActions)
└── ShellContent (children, min-h-0 overflow-y-auto)
```

## 서버/클라이언트 경계

```
서버 컴포넌트 : admin-shell.tsx, sidebar.tsx, topbar.tsx
클라이언트    : shell-context.tsx      ShellRoot(상태), useShellState()
                sidebar-collapse.tsx   SidebarCollapseToggle, SidebarTooltip
```

접힘 상태는 셸 루트의 `data-collapsed` 를 `group-data-collapsed/shell:` 변형으로 읽어
**CSS 만으로** 처리한다. 그래서 Sidebar/Topbar 에 상태가 필요 없다.

예외는 툴팁이다. 포털로 `body` 에 렌더되어 group 변형이 닿지 않으므로 접힘 여부를
JS 로 알아야 하고, 그 부분만 `sidebar-collapse.tsx` 로 분리했다.

## 확장 시 주의점

- Sidebar/Topbar는 서버 컴포넌트로 유지 (상태 필요시 얇은 client Provider만 내부에 추가)
- 라우팅 비의존: Slot 기반 asChild 패턴으로 `<a>` / `<Link>` 주입은 소비자 책임
- 셸이 제공하는 아이콘 버튼은 아이콘을 `children` 기본값으로 둔다
  (상태별 표현은 `useShellState()` 를 쓰는 소비자 몫)
