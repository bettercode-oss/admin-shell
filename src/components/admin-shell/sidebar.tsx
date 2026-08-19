import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

function Sidebar({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        "[grid-area:sidebar] flex min-h-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
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
 *   <SidebarNavItem icon={<Home />} active asChild>
 *     <Link href="/"><span>대시보드</span></Link>
 *   </SidebarNavItem>
 */
function SidebarNavItem({
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
    <li data-slot="sidebar-nav-item">
      <Comp
        data-active={active || undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-9 items-center gap-2.5 overflow-hidden rounded-md px-2.5 text-sm whitespace-nowrap text-sidebar-foreground/80 outline-none transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
          // 활성 배경은 --sidebar-accent 를 전경색 쪽으로 조금 더 섞어 만든다.
          // 새 토큰을 만들면 이 파일만 복사해간 프로젝트에서 색이 죽으므로,
          // shadcn 기본 토큰만으로 계산한다(button.tsx 가 쓰는 것과 같은 방식).
          "data-active:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_3%)] data-active:font-medium data-active:text-sidebar-accent-foreground",
          "[&>span]:truncate [&_svg]:size-4 [&_svg]:shrink-0",
          className
        )}
        {...props}
      >
        {icon}
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
      </Comp>
    </li>
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "mt-auto flex shrink-0 items-center gap-2 overflow-hidden border-t border-sidebar-border p-3 whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarFooter,
}
