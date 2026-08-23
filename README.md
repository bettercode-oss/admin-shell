# admin-shell
특정 프로젝트 로직이 전혀 없는 순수 레이아웃/UI 셸

- 다른 프로젝트에 **가져다 쓰려면** → [복사해서 쓰는 방법](#다른-프로젝트에-복사해서-쓰는-방법)
- 이미 쓰고 있고 **갱신하려면** → [CHANGELOG](CHANGELOG.md)
- **이 저장소를 고치려면** → [개발하기](#이-저장소-자체를-개발하려면)

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
치수와 색 혼합 비율은 CSS 변수로 노출되어 있어 소비하는 쪽에서 덮어쓸 수 있습니다.

```
--admin-shell-sidebar-width: 16rem             펼친 사이드바 폭
--admin-shell-sidebar-width-collapsed: 4rem    접힌 사이드바 폭
--admin-shell-topbar-height: 3.5rem            토프바 높이
--admin-shell-active-mix: 3%                   활성 메뉴 배경을 전경색 쪽으로 섞는 비율
```

```tsx
<AdminShell style={{ "--admin-shell-sidebar-width": "18rem" }}>
```

접기가 이 변수들을 어떻게 쓰는지는 [ARCHITECTURE.md](ARCHITECTURE.md) 를 보세요.

## 다른 프로젝트에 복사해서 쓰는 방법

npm 패키지가 아니라 **파일을 복사해 쓰는** 방식입니다(shadcn/ui 와 같은 방식).

> 이미 복사해 쓰고 있고 **갱신**하려는 것이라면 [CHANGELOG](CHANGELOG.md) 를 먼저 보세요.
> 새로 설치할 shadcn 컴포넌트가 생겼는지, 공개 API 가 바뀌었는지가 거기 있습니다.

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
npx shadcn@latest add button tooltip sheet separator collapsible popover command
```

`command` 는 `dialog` 와 `input-group` 을 함께 가져옵니다.

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
| `command-palette.tsx` | `shell-context` | button, command | lucide, `cn()` |
| `topbar.tsx` | — | — | `radix-ui`(Slot), `cn()` |
| `shell-context.tsx` | — | — | — |
| `sidebar-styles.ts` | — | — | — |

`shell-context.tsx` 와 `sidebar-styles.ts` 는 외부 의존이 아예 없습니다. `topbar.tsx` 도 같은
폴더의 다른 파일을 참조하지 않아 단독으로 떼어갈 수 있지만, `cn()` 과 `radix-ui`(Slot) 가
필요합니다 — `TopbarNavItem` 의 `asChild` 가 씁니다. 셋 다 shadcn 컴포넌트는 필요 없습니다.

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

`sidebar-submenu.tsx`(2단계 메뉴)와 `command-palette.tsx`(커맨드 팔레트)는 `sidebar.tsx` 가
참조하지 않으므로 필요 없으면 빼도 됩니다. 그 경우 `collapsible` / `popover` / `command` 도
필요 없습니다.

`useShellState()` 는 Provider 없이도 동작합니다. `AdminShell` 없이 `Sidebar` 만 가져가도
컴포넌트가 스스로 상태를 들고 동작합니다.

## 컴포넌트

**레이아웃**

| | |
|---|---|
| `AdminShell` | 셸 컨테이너. 상태와 `TooltipProvider` 를 품는다 |
| `ShellContent` | 본문. 사이드바·토프바는 고정되고 여기만 스크롤된다 |

**사이드바**

| | |
|---|---|
| `Sidebar` | 데스크톱에서는 그리드 칸, 좁은 화면에서는 드로어 |
| `SidebarHeader` | 헤더. `SidebarHeaderTitle`(접히면 숨음) 과 `SidebarHeaderActions` 를 담는다 |
| `SidebarCollapseToggle` | 접기/펼치기 버튼 |
| `SidebarNav` | 네비게이션 |
| `SidebarGroup` | 구분 라벨로 묶기. 접히면 라벨 대신 구분선 |
| `SidebarNavItem` | 메뉴 항목. `icon` / `active` / `tooltip` / `asChild` |
| `SidebarNavSubmenu` | 2단계 메뉴. 펼침=아코디언, 접힘=팝오버 |
| `SidebarFooter` | 하단 슬롯 |

**토프바**

| | |
|---|---|
| `Topbar` / `TopbarTitle` / `TopbarActions` | 토프바와 슬롯 |
| `TopbarNav` | 수평 메뉴. 사이드바 트리의 펼쳐진 가지를 옆으로 편 것 |
| `TopbarNavItem` | 수평 메뉴 항목. `icon` / `active` / `emphasis` / `asChild` |
| `TopbarMenuButton` | 모바일 드로어를 여는 햄버거. 데스크톱에서는 숨는다 |

**커맨드 팔레트**

| | |
|---|---|
| `CommandPalette` | ⌘K 로 열리는 팔레트. 내용은 children 으로 조립한다 |
| `CommandPaletteTrigger` | 팔레트를 여는 아이콘 버튼 |
| `CommandInput` `CommandList` `CommandEmpty` `CommandGroup` `CommandItem` `CommandSeparator` `CommandShortcut` | 팔레트 내용 조립용 (shadcn 것을 그대로 재수출) |

**훅**

| | |
|---|---|
| `useShellState()` | 접힘 · 모바일 드로어 · 팔레트 열림 상태 |
| `useIsMobile()` | 브레이크포인트(`max-width: 767px`) 판별 |

## 조립 예제

```tsx
<AdminShell>
  <Sidebar>
    <SidebarHeader>
      <SidebarHeaderTitle>제품명</SidebarHeaderTitle>
      <SidebarHeaderActions>
        <CommandPaletteTrigger />
        <SidebarCollapseToggle />
      </SidebarHeaderActions>
    </SidebarHeader>

    <SidebarNav aria-label="주요 메뉴">
      <SidebarGroup label="운영">
        <SidebarNavItem icon={<Home />} tooltip="대시보드" active asChild>
          <Link href="/"><span>대시보드</span></Link>
        </SidebarNavItem>

        <SidebarNavSubmenu icon={<Users />} label="사용자" defaultOpen>
          <SidebarNavItem asChild>
            <Link href="/users"><span>목록</span></Link>
          </SidebarNavItem>
        </SidebarNavSubmenu>
      </SidebarGroup>
    </SidebarNav>

    <SidebarFooter>v0.1.0</SidebarFooter>
  </Sidebar>

  <Topbar>
    <TopbarMenuButton />
    <TopbarTitle>사용자</TopbarTitle>
    <TopbarNav aria-label="사용자">
      <TopbarNavItem active asChild><Link href="/users">목록</Link></TopbarNavItem>
      <TopbarNavItem asChild><Link href="/users/new">추가</Link></TopbarNavItem>
    </TopbarNav>
    <TopbarActions>{/* ... */}</TopbarActions>
  </Topbar>

  <ShellContent>{children}</ShellContent>

  <CommandPalette>
    <CommandInput placeholder="검색..." />
    <CommandList>
      <CommandEmpty>결과가 없습니다.</CommandEmpty>
      <CommandGroup heading="메뉴">
        <CommandItem onSelect={() => router.push("/users")}>사용자</CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandPalette>
</AdminShell>
```

### 토프바 수평 메뉴

`TopbarNav` 는 사이드바 트리에서 **지금 펼쳐진 가지**를 옆으로 펴놓은 것입니다. 같은 링크가
사이드바에도 트리로 남아 있는 것을 전제하며, 그래서 사이드바를 4rem 으로 접어도 지금 구역의
하위 메뉴는 토프바에 그대로 남습니다.

항목은 두 단계로 둘 수 있습니다. `emphasis="strong"` 이 섹션(대표) 항목이고, 기본값
`"default"` 가 그 아래 화면들입니다. 한 줄에 링크가 여럿 늘어서면 두께 차이 없이는 어디가
상위인지 읽히지 않습니다.

```tsx
<TopbarNav aria-label="사용자">
  <TopbarNavItem emphasis="strong" asChild><span>사용자</span></TopbarNavItem>
  <TopbarNavItem active asChild><Link href="/users">목록</Link></TopbarNavItem>
  <TopbarNavItem asChild><Link href="/users/new">추가</Link></TopbarNavItem>
</TopbarNav>
```

**`emphasis` 와 `active` 는 다른 축입니다.** `emphasis` 는 "어느 계층인가"(굵기와 글자색),
`active` 는 "지금 보고 있는 곳인가"(배경)를 말합니다. 섹션이 늘 활성인 것도, 활성이 늘
상위인 것도 아니라서 굵은 항목도 활성이 될 수 있고 그 반대도 됩니다.

섹션 이름이 **링크가 아니면** 위처럼 `<span>` 을 꽂습니다. `asChild` 가 있으므로 이걸 위한
컴포넌트가 따로 필요하지 않습니다.

### 섹션 이름을 `TopbarTitle` 로 둘지 `emphasis` 로 둘지

`TopbarTitle` 은 지금 보고 있는 **페이지**의 `<h1>` 이고, `TopbarNav` 항목은 **갈 수 있는
곳**입니다. 섹션 이름은 둘 중 하나로만 두세요 — 둘 다 쓰면 같은 이름이 두 번 나옵니다.

| | 언제 |
|---|---|
| `<TopbarTitle>` | 토프바에 `<h1>` 이 필요할 때. 문서 구조상 이쪽이 정석입니다 |
| `<TopbarNavItem emphasis="strong">` | 섹션이 메뉴의 일부로 읽혀야 할 때. 링크여도 됩니다 |

`TopbarTitle` 을 빼면 토프바에 `<h1>` 이 없으므로 본문이 자기 `<h1>` 을 가져야 합니다.

사이드바와 달리 라벨을 `<span>` 으로 감쌀 필요가 없습니다. 그 관례는 접힘 상태에서 라벨을
숨기는 셀렉터 하나 때문에 생긴 것이고 토프바에는 접힘이 없습니다.

폭이 모자라면 **메뉴가 제 안에서 가로로 스크롤**됩니다. 조용히 잘리지 않고, 제목과 액션도
밀려 찌그러지지 않습니다(`TopbarNav` 가 `flex-1` 로 남는 폭을 가져가기 때문입니다).
좁은 화면에서 아예 감추려면 — 드로어의 사이드바 트리가 같은 메뉴를 담당합니다 —

```tsx
<TopbarNav className="max-md:hidden">
```

내용 크기만 차지하게 하려면 `className="flex-none"` 입니다. 다만 그러면 메뉴가 길어질 때
`TopbarTitle` 이 함께 줄어듭니다.

세 가지가 이 라이브러리의 전제입니다.

- **라우터를 모릅니다.** `SidebarNavItem` 은 `href` 를 알지 못합니다. `asChild` 로 링크를
  꽂아 넣고 활성 여부는 `active` 로 주입합니다
- **검색 결과를 모릅니다.** 팔레트는 틀만 제공하고 무엇을 검색해 어떻게 그릴지는
  전부 children 으로 조립합니다
- **상태는 안 줘도 됩니다.** 접힘·드로어·팔레트 모두 비제어가 기본이고,
  `collapsed` / `open` 같은 props 를 주면 제어 모드로 바뀝니다

## 이 저장소 자체를 개발하려면

위 내용은 셸을 **가져다 쓰는** 사람을 위한 것이고, 아래는 이 저장소를 **고치는** 사람을 위한 것입니다.

```bash
git clone https://github.com/bettercode-oss/admin-shell.git
cd admin-shell
npm install
npm run dev
```

`http://localhost:3000` 에서 데모가 뜹니다. 3000 번이 이미 쓰이고 있으면 Next 가 다음 포트로
옮기므로, 터미널에 찍히는 주소를 확인하세요. 포트를 고정하려면 `npm run dev -- --port 3100`.

| 명령 | |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (타입 검사 포함) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | 타입만 검사 |

Node 22 / npm 10 에서 개발했습니다.

PR 을 올리면 CI 가 같은 셋(`tsc --noEmit` · `lint` · `build`)을 돌립니다. 소비자는 main 을
떠다 쓰므로 main 이 깨지면 그대로 옮아갑니다.

복사 단위(`src/components/admin-shell/`)를 고친 PR 은 `CHANGELOG.md` 도 함께 고쳐야
통과합니다. 내부 구현이나 주석만 바뀌어 적을 것이 없으면 PR 에 `no-changelog` 라벨을 붙입니다.

### 알아둘 것

- **`src/app/page.tsx` 는 컴포넌트 프리뷰/데모 전용입니다.** 제품 로직이나 실제 데이터 호출을
  넣지 않습니다. 셸에 넣을 자리가 애매한 것은 대개 데모에 둘 것도 아닙니다
- 셸 레이아웃을 건드리는 작업이면 [ARCHITECTURE.md](ARCHITECTURE.md) 를 먼저 읽으세요 —
  그리드 구조, CSS 변수, 서버/클라이언트 경계가 왜 그렇게 나뉘어 있는지 적혀 있습니다
- 구조나 동작이 바뀌면 ARCHITECTURE.md 를, 공개 API 가 바뀌면 이 README 를 같은 PR 에서
  갱신합니다. 자세한 원칙은 [CLAUDE.md](CLAUDE.md) 참조
