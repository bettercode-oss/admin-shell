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
├── Topbar (TopbarMenuButton / TopbarTitle / TopbarActions)
└── ShellContent (children, min-h-0 overflow-y-auto)
```

`Sidebar` 는 껍데기를 `SidebarFrame` 에 위임한다. 데스크톱에서는 그리드 칸을 차지하는
`<aside>` 이고, 좁은 화면에서는 Sheet 안으로 들어간다. 자식 구성은 양쪽이 같다.

## 서버/클라이언트 경계

```
서버 컴포넌트 : admin-shell.tsx, sidebar.tsx, topbar.tsx
클라이언트    : shell-context.tsx      ShellRoot(상태), useShellState(), useIsMobile()
                sidebar-collapse.tsx   SidebarCollapseToggle, SidebarTooltip
                mobile-drawer.tsx      SidebarFrame, TopbarMenuButton
```

접힘 상태는 셸 루트의 `data-collapsed` 를 `group-data-collapsed/shell:` 변형으로 읽어
**CSS 만으로** 처리한다. 그래서 Sidebar/Topbar 에 상태가 필요 없다.

예외는 두 가지이고 이유가 같다 — **포털로 `body` 에 렌더되어 셸 바깥에 놓이는 것들**이다.
group 변형도 CSS 변수도 닿지 않으므로 JS 로 상태를 알아야 한다.

- 툴팁 → `sidebar-collapse.tsx`
- 모바일 드로어 → `mobile-drawer.tsx`

## 반응형

`(max-width: 767px)`(Tailwind `md` 미만)에서 사이드바가 그리드에서 빠지고 드로어가 된다.

```
max-md:grid-cols-[minmax(0,1fr)]
max-md:[grid-template-areas:'topbar''content']
```

- 폭 판별은 `useIsMobile()` — `useSyncExternalStore` 로 `matchMedia` 를 구독한다.
  서버 스냅샷이 항상 `false`(데스크톱)라 하이드레이션 불일치가 없다
- 포커스 트랩 · ESC 닫기 · 바깥 클릭 닫기 · 스크롤 잠금은 Radix Dialog(Sheet)가 처리한다
- 드로어 폭은 **인라인 `style`** 로 준다. 클래스로 주면 shadcn 의
  `data-[side=left]:w-3/4` 가 특이도에서 이겨 75% 로 벌어진다.
  포털이라 `--admin-shell-sidebar-width` 를 물려받지 못하므로 실제 값은 폴백 `16rem` 이다
- 드로어가 닫혀 있으면 사이드바는 DOM 에 없다(Sheet 가 언마운트한다).
  모바일에서 메뉴 링크가 문서에 존재하지 않는다는 뜻이다
- 접기 토글은 `max-md:hidden` — 드로어에서는 접을 대상이 없다

## 확장 시 주의점

- Sidebar/Topbar는 서버 컴포넌트로 유지 (상태 필요시 얇은 client Provider만 내부에 추가)
- 라우팅 비의존: Slot 기반 asChild 패턴으로 `<a>` / `<Link>` 주입은 소비자 책임
- 셸이 제공하는 아이콘 버튼은 아이콘을 `children` 기본값으로 둔다
  (상태별 표현은 `useShellState()` 를 쓰는 소비자 몫)
