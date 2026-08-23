import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

function Topbar({
  className,
  title,
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  /** 편의용. 더 자유롭게 조립하려면 <TopbarTitle> 을 직접 넣으면 된다. */
  title?: React.ReactNode
}) {
  return (
    <header
      data-slot="topbar"
      className={cn(
        "[grid-area:topbar] flex h-(--admin-shell-topbar-height) items-center gap-3 border-b border-border bg-background px-4",
        className
      )}
      {...props}
    >
      {title ? <TopbarTitle>{title}</TopbarTitle> : null}
      {children}
    </header>
  )
}

/** 지금 보고 있는 페이지의 제목. 문서의 <h1> 이므로 화면에 하나만 둔다. */
function TopbarTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="topbar-title"
      className={cn("truncate text-base font-semibold", className)}
      {...props}
    />
  )
}

/**
 * 토프바 수평 메뉴. 사이드바 트리에서 "지금 펼쳐진 가지"를 옆으로 펴놓은 것이라,
 * 같은 메뉴가 사이드바에도 트리로 남아 있는 것을 전제한다. 링크가 두 곳에
 * 중복으로 존재하는 셈인데 의도한 것이다 — 접근 경로가 둘일 뿐이다.
 *
 * aria-label 은 한 화면에 nav 가 둘 이상일 때 서로를 구분하기 위한 것이라
 * 소비 제품의 언어로 덮어쓰는 것을 권장한다. 기본값이 "Topbar" 인 이유는
 * SidebarNav 의 "Sidebar" 와 반드시 달라지게 하기 위해서다.
 */
function TopbarNav({
  className,
  children,
  "aria-label": ariaLabel = "Topbar",
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="topbar-nav"
      aria-label={ariaLabel}
      className={cn(
        // flex-1(= flex:1 1 0%) 이라 남는 폭을 이 nav 가 전부 가져간다. 덕분에
        // 줄 자체가 넘치지 않고 초과분은 이 안에서만 가로로 스크롤되며,
        // TopbarTitle(truncate)과 TopbarActions 가 메뉴 길이에 밀려 찌그러지지 않는다.
        //
        // 부작용이 하나 있다. 자유 공간이 0 이 되어 TopbarActions 의 ml-auto 가
        // 흡수할 게 없어진다. 대신 nav 가 늘어나며 액션을 오른쪽 끝으로 미므로
        // 결과 위치는 같고, TopbarNav 를 안 쓰면 ml-auto 는 지금까지처럼 동작한다.
        //
        // 내용 크기로 두고 싶으면 className="flex-none".
        "min-w-0 flex-1 overflow-x-auto",
        // overflow 컨테이너는 스크롤바 유무와 무관하게 네 변 모두에서 클립한다.
        // 항목의 포커스 링(ring-3 = 3px)이 잘리지 않게 안쪽에 자리를 두고,
        // 가로는 음수 마진으로 시각적 위치를 되돌린다.
        "-mx-1 px-1 py-1",
        // 3.5rem 막대 안의 가로 스크롤바는 보기 나쁘고 세로 공간을 먹는다.
        // 스크롤 자체는 살아 있고, Tab 으로 이동하면 브라우저가 항목을 스크롤해
        // 넣으므로 키보드로 닿지 못하는 항목이 생기지는 않는다.
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      {...props}
    >
      <ul className="flex items-center gap-1">{children}</ul>
    </nav>
  )
}

/**
 * 토프바 항목이 쓰는 클래스.
 *
 * sidebar-styles.ts 처럼 파일을 나누지 않았다 — 그쪽은 sidebar.tsx 와
 * sidebar-submenu.tsx 가 서로 import 하면 순환이 되어 뺀 것이고, 이건 쓰는 곳이
 * 이 파일 하나뿐이다. topbar.tsx 를 단독으로 떼어갈 수 있는 상태도 그대로 유지된다.
 *
 * hover 를 배경이 아니라 글자색으로 둔 것은 활성 표시가 bg-accent 를 쓰기
 * 때문이다. 둘 다 배경을 쓰면 같은 색이 되어 구분이 사라진다. 사이드바가
 * hover 와 활성 모두 배경으로 표현할 수 있는 것은 활성 쪽이 color-mix 로
 * 한 단계 더 진하기 때문인데, 토프바는 아래 이유로 color-mix 를 쓰지 않는다.
 */
const topbarNavItemClass = [
  "flex h-8 items-center gap-2 rounded-md px-2.5 text-sm whitespace-nowrap outline-none transition-colors",
  "text-muted-foreground hover:text-foreground",
  "focus-visible:ring-3 focus-visible:ring-ring/50",
  // 활성 배경에 color-mix 를 쓰지 않는다. 사이드바가 그걸 쓰는 이유는
  // --sidebar(0.985)와 --sidebar-accent(0.97)의 명도차가 0.015 뿐이라서인데,
  // 토프바는 --background 와 --accent 의 차이가 라이트 0.03 · 다크 0.124 로
  // 이미 그 두 배 이상이다. --admin-shell-active-mix 는 사이드바 전용이다.
  //
  // 글자색을 accent-foreground 가 아니라 foreground 로 두는 이유는 라이트에서
  // --accent-foreground(0.205)가 --foreground(0.145)보다 옅기 때문이다.
  // 활성이 비활성보다 흐려지는 역전을 막는다.
  "data-active:bg-accent data-active:text-foreground",
  "[&_svg]:size-4 [&_svg]:shrink-0",
].join(" ")

/**
 * 라우터에 의존하지 않는다. asChild 로 소비자가 next/link 든 평범한 <a> 든
 * 꽂아 넣고, 활성 여부는 active prop 으로만 주입한다.
 *
 *   <TopbarNavItem active asChild>
 *     <Link href="/games">게임</Link>
 *   </TopbarNavItem>
 *
 * 사이드바와 달리 라벨을 <span> 으로 감쌀 필요가 없다. 그 관례는 접힘 상태에서
 * 라벨을 숨기는 셀렉터([&>span]:hidden) 하나 때문에 생긴 것이고 토프바에는
 * 접힘이 없다. 감싸도 문제는 없다.
 */
function TopbarNavItem({
  className,
  icon,
  active,
  asChild,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  icon?: React.ReactNode
  active?: boolean
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <li data-slot="topbar-nav-item">
      <Comp
        data-active={active || undefined}
        aria-current={active ? "page" : undefined}
        className={cn(topbarNavItemClass, className)}
        {...props}
      >
        {icon}
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
      </Comp>
    </li>
  )
}

function TopbarActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="topbar-actions"
      className={cn("ml-auto flex items-center gap-2", className)}
      {...props}
    />
  )
}

export { Topbar, TopbarTitle, TopbarNav, TopbarNavItem, TopbarActions }
