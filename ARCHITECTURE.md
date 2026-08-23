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

**이 변수는 사이드바 전용이다.** 토프바(`TopbarNavItem`)는 `color-mix` 를 쓰지 않고
`bg-accent` 를 그대로 쓴다. 사이드바가 색을 섞어야 했던 이유는 `--sidebar`(0.985)와
`--sidebar-accent`(0.97)의 명도차가 0.015 뿐이라서인데, 토프바가 놓인 `--background` 와
`--accent` 의 차이는 라이트 0.03 · 다크 0.124 로 이미 그 두 배 이상이다.

## Component Tree

```
AdminShell                         TooltipProvider + ShellRoot(상태) + 그리드
├── Sidebar
│   ├── SidebarHeader
│   │   ├── SidebarHeaderTitle     접히면 숨는다
│   │   └── SidebarHeaderActions
│   │       └── SidebarCollapseToggle
│   ├── SidebarNav
│   │   └── SidebarGroup           label(선택) + 중첩 <ul>
│   │       ├── SidebarNavItem     icon / active / tooltip / asChild
│   │       └── SidebarNavSubmenu  2단계 메뉴 (SidebarNavItem 들을 감싼다)
│   └── SidebarFooter
├── Topbar
│   ├── TopbarMenuButton       좁은 화면에서만 (mobile-drawer.tsx)
│   ├── TopbarTitle            지금 보고 있는 페이지의 <h1>
│   ├── TopbarNav              수평 메뉴 <nav><ul>
│   │   └── TopbarNavItem      icon / active / asChild
│   └── TopbarActions
├── ShellContent (children, min-h-0 overflow-y-auto)
└── CommandPalette              내용은 소비자가 children 으로 조립
```

`Sidebar` 는 껍데기를 `SidebarFrame` 에 위임한다. 데스크톱에서는 그리드 칸을 차지하는
`<aside>` 이고, 좁은 화면에서는 Sheet 안으로 들어간다. 자식 구성은 양쪽이 같다.

## 서버/클라이언트 경계

```
서버 컴포넌트 : admin-shell.tsx, sidebar.tsx, topbar.tsx
클라이언트    : shell-context.tsx      ShellRoot(상태), useShellState(), useIsMobile()
                sidebar-collapse.tsx   SidebarCollapseToggle, SidebarTooltip
                mobile-drawer.tsx      SidebarFrame, TopbarMenuButton
                sidebar-submenu.tsx    SidebarNavSubmenu
                command-palette.tsx    CommandPalette, CommandPaletteTrigger
공용            : sidebar-styles.ts     메뉴 행 클래스 (leaf 와 트리거가 공유)
```

접힘 상태는 셸 루트의 `data-collapsed` 를 `group-data-collapsed/shell:` 변형으로 읽어
**CSS 만으로** 처리한다. 그래서 Sidebar/Topbar 에 상태가 필요 없다.

`asChild` 에 쓰는 radix `Slot` 은 클라이언트 경계를 만들지 않는다 — `"use client"` 가 없고
쓰는 훅이 `useCallback` 하나뿐이라 RSC 안에서 돈다. `sidebar.tsx` 와 `topbar.tsx` 가 둘 다
`Slot` 을 쓰면서 서버 컴포넌트로 남는 이유다.

예외는 두 가지이고 이유가 같다 — **포털로 `body` 에 렌더되어 셸 바깥에 놓이는 것들**이다.
group 변형도 CSS 변수도 닿지 않으므로 JS 로 상태를 알아야 한다.

- 툴팁 → `sidebar-collapse.tsx`
- 모바일 드로어 → `mobile-drawer.tsx`
- 접힘 상태의 중첩 메뉴 팝오버 → `sidebar-submenu.tsx`
- 커맨드 팔레트 → `command-palette.tsx`

포털 밖에 놓이는 덕을 보기도 한다. 팝오버 안의 `SidebarNavItem` 은
`group-data-collapsed/shell` 이 닿지 않아 라벨이 그대로 보인다 — 접힘용 분기를
따로 쓰지 않아도 된다.

## 토프바 수평 메뉴

`TopbarNav` 는 사이드바 트리의 **지금 펼쳐진 가지**를 옆으로 편 것이다. 같은 링크가 사이드바와
토프바 양쪽에 중복으로 존재하게 되는데 의도한 것이다 — 접근 경로가 둘일 뿐이고, 두 `<nav>` 의
`aria-label` 이 다르면(`"Sidebar"` / `"Topbar"`) 스크린 리더에서 구분된다. 사이드바를 4rem 으로
접으면 하위 메뉴가 팝오버로만 닿는데, 그때 토프바 메뉴가 같은 것을 그대로 보여준다.

### `flex-1` 이 제목과 액션을 지킨다

`TopbarNav` 의 `flex-1`(= `flex:1 1 0%`)은 지워도 될 것처럼 보이지만 **없으면 레이아웃이 무너진다.**

없으면 nav 의 기준 크기가 내용 크기가 되고, 메뉴가 길어질 때 축소가 기준 크기에 비례해
나뉜다. `TopbarTitle` 은 `truncate`(`overflow:hidden`) 라 자동 최소 크기가 0 이므로 **긴 메뉴가
페이지 제목을 같이 뭉갠다.** `flex-1` 이면 nav 의 기준 크기가 0 이라 줄 자체가 넘치지 않고,
초과분은 nav 안에서만 가로로 스크롤된다.

실측(항목 3개, 헤더 폭을 줄여가며):

| 헤더 | 제목 | nav | 액션 |
|---|---|---|---|
| 900px | 42 | 664 | 146 |
| 460px | 42 | 224 | 146 |
| 380px | 42 | 144 (스크롤) | 146 |
| 320px | 42 | 84 (스크롤) | 146 |
| 240px | 38 | 8 | 146 |

320px 까지는 제목과 액션이 온전하고 nav 만 줄며 스크롤된다. 240px 아래에서는 nav 가 더 줄어들
수 없어(기준 크기 0) 제목이 축소를 떠안는데, 실제 기기 폭 밖이라 그대로 둔다.

부작용이 하나 있다. 자유 공간이 0 이 되어 `TopbarActions` 의 `ml-auto` 가 흡수할 게 없어진다.
대신 nav 가 늘어나며 액션을 오른쪽 끝으로 미므로 결과 위치는 같고, `TopbarNav` 를 쓰지 않는
기존 조립에서는 `ml-auto` 가 지금까지처럼 동작한다.

### 포커스 링과 스크롤바

`overflow-x-auto` 는 스크롤바 유무와 무관하게 **패딩 박스 네 변 모두에서 클립**한다.
항목의 `focus-visible:ring-3`(3px)이 잘리므로 `-mx-1 px-1 py-1` 로 안쪽에 4px 자리를 두고
가로는 음수 마진으로 시각적 위치를 되돌린다.

스크롤바는 감춘다(`[scrollbar-width:none]`). 3.5rem 막대 안의 가로 스크롤바는 세로 공간을
먹는다. 스크롤 자체는 살아 있고 Tab 으로 이동하면 브라우저가 항목을 스크롤해 넣는다.

### hover 는 글자색, 활성은 배경

사이드바는 hover 와 활성을 모두 배경으로 표현할 수 있다. 활성 쪽이 `color-mix` 로 한 단계
더 진하기 때문이다. 토프바는 `color-mix` 를 쓰지 않으므로(위 「CSS Variables」) 둘 다 배경을
쓰면 같은 색이 된다. 그래서 채널을 나눈다 — hover 는 `text-foreground`, 활성은 `bg-accent`.

활성 글자색이 `accent-foreground` 가 아니라 `foreground` 인 것도 이유가 있다. 라이트에서
`--accent-foreground`(0.205)가 `--foreground`(0.145)보다 **옅어서**, 그대로 쓰면 활성이
비활성보다 흐려지는 역전이 생긴다.

### `emphasis` 와 `active` 는 직교한다

두 축이 **서로 다른 채널**을 쓴다. 그래서 네 상태가 모두 구분된다.

| | `emphasis="default"` | `emphasis="strong"` |
|---|---|---|
| 보통 | `text-muted-foreground` / normal | `text-foreground` / `font-semibold` |
| 활성 | `bg-accent` + `text-foreground` / normal | `bg-accent` + `text-foreground` / `font-semibold` |

- `emphasis` = 글자 굵기 + 글자색 — 어느 계층인가
- `active` = 배경 — 지금 보고 있는 곳인가

섹션이 늘 활성인 것도, 활성이 늘 상위인 것도 아니다. 한 prop 에 뭉치면 `active` 를 주는
순간 위계가 사라지거나 그 반대가 된다.

`data-emphasis` 는 `data-active` 와 달리 **항상 렌더한다.** 플래그가 아니라 enum 이고,
소비자가 `[data-emphasis=strong]` 으로 자기 스타일을 얹을 수 있는 안정적인 훅이 된다.
셀렉터 형태도 다르다 — `data-[emphasis=strong]:` 은 값 매칭이고 `data-active:` 는 속성
존재만 보는 축약형이다.

**사이드바에는 이 구분이 없다.** 트리는 들여쓰기와 그룹 라벨(`SidebarGroup`)로 위계를
이미 드러내는데, 토프바는 한 줄이라 들여쓸 자리가 없어 굵기로 대신한다.

## 중첩 메뉴

`SidebarNavSubmenu` 는 사이드바 상태에 따라 두 가지로 렌더된다.

| 사이드바 | 렌더 | 여는 방법 |
|---|---|---|
| 펼침 | Collapsible 아코디언 | 트리거 클릭 |
| 접힘(4rem) | Popover | 포인터 hover, 키보드 Enter/Space |

접힘 상태에서 아코디언을 쓸 수 없는 이유는 4rem 폭에 하위 항목을 펼칠 자리가 없어서다.

**HoverCard 가 아니라 Popover 인 이유**: HoverCard 는 설계상 키보드로 내용에 들어갈 수
없다. Tab 으로 트리거에 닿으면 열리기는 하지만 다음 Tab 이 팝오버를 건너뛰고 사이드바의
다음 메뉴로 간다. Popover 는 열릴 때 포커스를 내용으로 옮기고 Escape 로 트리거에
돌려준다. 포인터용 hover 는 `onPointerEnter`/`onPointerLeave` 로 직접 붙이고,
hover 로 열렸을 때는 `onOpenAutoFocus` 를 막아 포커스를 빼앗지 않는다.

닫기는 150ms 늦춘다. 트리거에서 팝오버로 커서를 옮기는 사이(`sideOffset` 만큼의 틈)에
닫히지 않게 하기 위해서다.

모바일 드로어 안에서는 접힘이 적용되지 않으므로(`collapsed && !isMobile`) 항상
아코디언이다.

## 커맨드 팔레트

`CommandPalette` 는 **틀만** 제공한다. 무엇을 검색하고 결과를 어떻게 그릴지는 전부
소비자가 children 으로 조립한다.

```tsx
<CommandPalette>
  <CommandInput placeholder="검색..." />
  <CommandList>
    <CommandEmpty>결과가 없습니다.</CommandEmpty>
    <CommandGroup heading="메뉴">
      <CommandItem onSelect={() => router.push("/users")}>사용자</CommandItem>
    </CommandGroup>
  </CommandList>
</CommandPalette>
```

결과를 `onSearch` 같은 콜백으로 받지 않는 이유는, 그렇게 하면 결과의 데이터 모양이
라이브러리 계약이 되어 "제품 데이터 타입을 두지 않는다" 는 원칙이 깨지기 때문이다.

- 열림 상태는 셸이 들고 있다(`searchOpen`). 그래서 `CommandPaletteTrigger` 와
  배선 없이 이어진다. `open` / `onOpenChange` 를 주면 제어 모드
- `shortcut={false}` 로 ⌘K / Ctrl+K 를 끌 수 있다
- 필터링은 cmdk 기본 동작이다(렌더된 항목의 텍스트 기준). 비동기 검색을 직접 하려면
  `shouldFilter={false}` 를 넘기면 된다
- `CommandInput` / `CommandList` / `CommandEmpty` / `CommandGroup` / `CommandItem` /
  `CommandSeparator` / `CommandShortcut` 은 shadcn 것을 `index.ts` 에서 그대로 다시
  내보낸다. 소비자가 한곳에서 import 하도록 하기 위한 것이다

**주의**: 이 버전의 shadcn `CommandDialog` 는 children 을 `DialogContent` 에 그대로
넣기만 한다. `CommandPalette` 가 `<Command>` 로 감싸주지 않으면 `CommandInput` 이
cmdk 컨텍스트 없이 마운트되어 팔레트를 여는 순간 앱이 죽는다
(`Cannot read properties of undefined (reading 'subscribe')`).

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
- 토프바 수평 메뉴는 **감추지 않는다.** 폭이 모자라면 제 안에서 가로로 스크롤되며, 무엇을
  감출지는 소비자가 정할 일이라 기본값으로 결정하지 않는다(`className="max-md:hidden"`)

## 확장 시 주의점

- Sidebar/Topbar는 서버 컴포넌트로 유지 (상태 필요시 얇은 client Provider만 내부에 추가)
- 라우팅 비의존: Slot 기반 asChild 패턴으로 `<a>` / `<Link>` 주입은 소비자 책임
- 셸이 제공하는 아이콘 버튼은 아이콘을 `children` 기본값으로 둔다
  (상태별 표현은 `useShellState()` 를 쓰는 소비자 몫)
