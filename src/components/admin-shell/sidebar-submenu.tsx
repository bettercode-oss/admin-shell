"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"

import { useIsMobile, useShellState } from "./shell-context"
import { sidebarNavItemClass } from "./sidebar-styles"

/**
 * 2단계 깊이 메뉴. 자식으로 SidebarNavItem 들을 받는다.
 *
 *   <SidebarNavSubmenu icon={<Users />} label="사용자" defaultOpen>
 *     <SidebarNavItem asChild><Link href="/users"><span>목록</span></Link></SidebarNavItem>
 *   </SidebarNavSubmenu>
 *
 * 펼친 사이드바에서는 아코디언, 접힌(아이콘) 사이드바에서는 hover 팝오버가 된다.
 * 4rem 폭에 하위 항목을 펼칠 자리가 없기 때문이다.
 *
 * 팝오버는 툴팁·드로어와 같은 이유로 클라이언트다 — 포털로 body 에 렌더되어
 * group-data-collapsed/shell 변형이 닿지 않으므로 접힘 여부를 JS 로 알아야 한다.
 * 덕분에 팝오버 안의 SidebarNavItem 은 접힘 변형이 걸리지 않아 라벨이 그대로 보인다.
 */
function SidebarNavSubmenu({
  className,
  icon,
  label,
  active,
  defaultOpen,
  open,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  icon?: React.ReactNode
  label: React.ReactNode
  active?: boolean
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { collapsed } = useShellState()
  const isMobile = useIsMobile()
  // 모바일 드로어 안에서는 접힘이 적용되지 않는다(폭이 그대로다).
  const iconMode = collapsed && !isMobile

  const trigger = (
    <button
      type="button"
      data-slot="sidebar-nav-submenu-trigger"
      data-active={active || undefined}
      className={cn("group/submenu", sidebarNavItemClass, className)}
      {...props}
    >
      {icon}
      <span>{label}</span>
      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/submenu:rotate-180 group-data-collapsed/shell:hidden" />
    </button>
  )

  if (iconMode) {
    return (
      <li data-slot="sidebar-nav-submenu">
        <HoverCard openDelay={80} closeDelay={120}>
          <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
          <HoverCardContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-52 p-1"
          >
            <div className="truncate px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {label}
            </div>
            <ul className="flex flex-col gap-0.5">{children}</ul>
          </HoverCardContent>
        </HoverCard>
      </li>
    )
  }

  return (
    <li data-slot="sidebar-nav-submenu">
      <Collapsible
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l border-sidebar-border pl-2">
            {children}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

export { SidebarNavSubmenu }
