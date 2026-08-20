# admin-shell
특정 프로젝트 로직이 전혀 없는 순수 레이아웃/UI 셸

## Layout

AdminShell은 Sidebar + Topbar + Content 3영역 그리드 레이아웃입니다.

```
┌──────────┬─────────────────────┐
│          │       Topbar        │
│ Sidebar  ├─────────────────────┤
│          │   Content (scroll)  │
└──────────┴─────────────────────┘
```

```tsx
<AdminShell>
  <Sidebar>...</Sidebar>
  <Topbar>...</Topbar>
  <ShellContent>...</ShellContent>
</AdminShell>
```

Sidebar와 Topbar는 고정되고 ShellContent 영역만 스크롤됩니다.
폭과 높이는 CSS 변수로 노출되어 있어 소비하는 쪽에서 덮어쓸 수 있습니다.

```
--admin-shell-sidebar-width: 16rem
--admin-shell-topbar-height: 3.5rem
```

## 복사해서 쓰기

npm 패키지가 아니라 **파일을 복사해 쓰는** 방식입니다(shadcn/ui 와 같은 방식).

복사 단위는 `src/components/admin-shell/` **폴더 전체**입니다. 파일끼리 서로 참조하므로
하나만 떼어가면 컴파일되지 않습니다.

### 전제 조건

- Tailwind v4
- shadcn/ui 토큰 — `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`,
  `--sidebar-border`, `--sidebar-ring` 이 정의되어 있어야 합니다 (`npx shadcn@latest init` 이
  기본으로 넣어줍니다). 없으면 사이드바 색이 죽습니다
- `cn()` 유틸 (`src/lib/utils.ts`)

### 필요한 shadcn 컴포넌트

```
npx shadcn@latest add button tooltip sheet separator collapsible popover
```

아이콘 기본값으로 `lucide-react` 를 씁니다. 다른 아이콘 세트를 쓴다면 셸이 제공하는
아이콘 버튼은 `children` 으로 덮어쓸 수 있습니다.

```tsx
<SidebarCollapseToggle><Bars3Icon className="size-4" /></SidebarCollapseToggle>
```

### 파일별 의존

| 파일 | 같은 폴더 | shadcn ui | 기타 |
|---|---|---|---|
| `admin-shell.tsx` | `shell-context` | tooltip | `cn()` |
| `sidebar.tsx` | `mobile-drawer`, `sidebar-collapse`, `sidebar-styles` | separator | `radix-ui`(Slot), `cn()` |
| `sidebar-collapse.tsx` | `shell-context` | button, tooltip | lucide, `cn()` |
| `sidebar-submenu.tsx` | `shell-context`, `sidebar-styles` | collapsible, popover | lucide, `cn()` |
| `mobile-drawer.tsx` | `shell-context` | button, sheet | lucide, `cn()` |
| `topbar.tsx` | — | — | `cn()` |
| `shell-context.tsx` | — | — | — |
| `sidebar-styles.ts` | — | — | — |

`shell-context.tsx` 와 `sidebar-styles.ts` 는 외부 의존이 없고, `topbar.tsx` 는 `cn()` 하나만
필요하므로 이 셋은 단독으로 떼어가도 됩니다.

### 사이드바만 쓰고 싶다면

`sidebar.tsx` 는 아래를 함께 가져가야 합니다.

```
sidebar.tsx
├── mobile-drawer.tsx      ← 데스크톱/드로어 분기
├── sidebar-collapse.tsx   ← 접힘 툴팁
├── sidebar-styles.ts      ← 메뉴 행 클래스
└── shell-context.tsx      ← 위 둘이 상태를 읽는다

shadcn ui: button, tooltip, sheet, separator
```

`sidebar-submenu.tsx`(2단계 메뉴)는 `sidebar.tsx` 가 참조하지 않으므로, 중첩 메뉴가 필요
없다면 빼도 됩니다. 그 경우 `collapsible` 과 `popover` 도 필요 없습니다.

`useShellState()` 는 Provider 없이도 동작합니다. `AdminShell` 없이 `Sidebar` 만 가져가도
컴포넌트가 스스로 상태를 들고 동작합니다.
