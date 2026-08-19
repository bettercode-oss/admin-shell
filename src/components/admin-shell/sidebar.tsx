import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

import { SidebarTooltip } from "./sidebar-collapse"

function Sidebar({
  className,
  id = "admin-shell-sidebar",
  ...props
}: React.ComponentProps<"aside">) {
  return (
    <aside
      id={id}
      data-slot="sidebar"
      className={cn(
        "[grid-area:sidebar] flex min-h-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex h-(--admin-shell-topbar-height) shrink-0 items-center gap-2 overflow-hidden border-b border-sidebar-border px-4 font-semibold whitespace-nowrap",
        "group-data-collapsed/shell:justify-center group-data-collapsed/shell:px-0",
        className
      )}
      {...props}
    />
  )
}

/** 접히면 사라지는 제품명 슬롯. 접힘 상태에서 남길 것은 SidebarHeaderActions 에 둔다. */
function SidebarHeaderTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header-title"
      className={cn(
        "truncate group-data-collapsed/shell:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarHeaderActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header-actions"
      className={cn(
        "ml-auto flex shrink-0 items-center gap-1 group-data-collapsed/shell:ml-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * aria-label 은 화면에 여러 개의 네비게이션이 있을 때 서로를 구분하기 위한 것이라
 * 소비 제품의 언어로 덮어쓰는 것을 권장한다.
 */
function SidebarNav({
  className,
  children,
  "aria-label": ariaLabel = "Sidebar",
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-nav"
      aria-label={ariaLabel}
      className={cn("min-h-0 flex-1 overflow-y-auto p-2", className)}
      {...props}
    >
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </nav>
  )
}

/**
 * 라우터에 의존하지 않는다. asChild 로 소비자가 next/link 든 react-router 의 Link 든
 * 평범한 <a> 든 꽂아 넣고, 활성 여부는 active prop 으로만 주입한다.
 *
 *   <SidebarNavItem icon={<Home />} tooltip="대시보드" active asChild>
 *     <Link href="/"><span>대시보드</span></Link>
 *   </SidebarNavItem>
 *
 * tooltip 을 주면 접힘 상태에서 라벨이 툴팁으로 뜬다. 라벨 텍스트는 소비자가
 * 주입한 children 안에 있어 컴포넌트가 알 수 없으므로 따로 받는다.
 */
function SidebarNavItem({
  className,
  icon,
  active,
  asChild,
  tooltip,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  icon?: React.ReactNode
  active?: boolean
  asChild?: boolean
  tooltip?: React.ReactNode
}) {
  const Comp = asChild ? Slot.Root : "a"

  const item = (
    <Comp
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-2.5 overflow-hidden rounded-md px-2.5 text-sm whitespace-nowrap text-sidebar-foreground/80 outline-none transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
        // 활성 배경은 --sidebar-accent 를 전경색 쪽으로 섞어 만든다. 섞는 비율은
        // --admin-shell-active-mix 로 조정한다(AdminShell 이 3% 로 선언).
        // 폴백 3% 를 둔 이유는 이 파일만 복사해가도 동작해야 하기 때문이다 —
        // 변수가 없으면 color-mix 전체가 무효가 되어 배경이 아예 사라진다.
        // 새 색상 토큰을 만들지 않고 shadcn 기본 토큰만으로 계산하는 것도 같은 이유다.
        "data-active:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_var(--admin-shell-active-mix,3%))] data-active:font-medium data-active:text-sidebar-accent-foreground",
        // 접힘: 아이콘만 남기고 가운데 정렬
        "group-data-collapsed/shell:justify-center group-data-collapsed/shell:gap-0 group-data-collapsed/shell:px-0",
        "group-data-collapsed/shell:[&>span]:hidden",
        "[&>span]:truncate [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {icon}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
    </Comp>
  )

  return (
    <li data-slot="sidebar-nav-item">
      {tooltip ? <SidebarTooltip label={tooltip}>{item}</SidebarTooltip> : item}
    </li>
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "mt-auto flex shrink-0 items-center gap-2 overflow-hidden border-t border-sidebar-border p-3 whitespace-nowrap",
        "group-data-collapsed/shell:justify-center group-data-collapsed/shell:px-0",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarHeaderActions,
  SidebarNav,
  SidebarNavItem,
  SidebarFooter,
}
