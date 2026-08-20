import * as React from "react"
import { Slot } from "radix-ui"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { SidebarFrame } from "./mobile-drawer"
import { SidebarTooltip } from "./sidebar-collapse"
import { sidebarNavItemClass } from "./sidebar-styles"

/**
 * 데스크톱에서는 그리드 칸, 좁은 화면에서는 드로어가 된다. 그 분기는
 * SidebarFrame(클라이언트)이 맡고 이 파일은 서버 컴포넌트로 남는다.
 */
function Sidebar(props: React.ComponentProps<typeof SidebarFrame>) {
  return <SidebarFrame {...props} />
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
 * 메뉴를 구분 라벨로 묶는다. SidebarNav 의 <ul> 안에 들어가므로 <li> 이고,
 * 자식 항목은 중첩 <ul> 에 담긴다.
 *
 * 접히면 라벨은 사라지고 구분선만 남는다 — 4rem 폭에 라벨을 넣을 자리가 없다.
 * 서버 컴포넌트라 useId 를 쓸 수 없어, label 이 문자열일 때만 aria-label 로 연결한다.
 */
function SidebarGroup({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"li"> & { label?: React.ReactNode }) {
  return (
    <li
      data-slot="sidebar-group"
      className={cn("mt-3 first:mt-0", className)}
      {...props}
    >
      {label ? (
        <>
          <div
            data-slot="sidebar-group-label"
            className="truncate px-2.5 pb-1 text-xs font-medium text-sidebar-foreground/50 group-data-collapsed/shell:hidden"
          >
            {label}
          </div>
          <Separator className="mt-1 mb-2 hidden bg-sidebar-border group-data-collapsed/shell:block" />
        </>
      ) : null}

      <ul
        role="group"
        aria-label={typeof label === "string" ? label : undefined}
        className="flex flex-col gap-0.5"
      >
        {children}
      </ul>
    </li>
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
      className={cn(sidebarNavItemClass, className)}
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
  SidebarGroup,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarHeaderActions,
  SidebarNav,
  SidebarNavItem,
  SidebarFooter,
}
