"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
 * 펼친 사이드바에서는 아코디언, 접힌(아이콘) 사이드바에서는 팝오버가 된다.
 * 4rem 폭에 하위 항목을 펼칠 자리가 없기 때문이다.
 *
 * 팝오버는 툴팁·드로어와 같은 이유로 클라이언트다 — 포털로 body 에 렌더되어
 * group-data-collapsed/shell 변형이 닿지 않으므로 접힘 여부를 JS 로 알아야 한다.
 * 덕분에 팝오버 안의 SidebarNavItem 은 접힘 변형이 걸리지 않아 라벨이 그대로 보인다.
 *
 * HoverCard 가 아니라 Popover 를 쓴다. HoverCard 는 설계상 키보드로 내용에 들어갈 수
 * 없어서(Tab 이 팝오버를 건너뛰고 다음 메뉴로 간다) "키보드만으로 하위 항목까지 도달"
 * 이라는 요구를 만족하지 못한다. Popover 로 두고 포인터에는 hover, 키보드에는
 * Enter/Space 로 열리게 해 양쪽을 모두 만족시킨다.
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

  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const openedByPointer = React.useRef(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // useCallback 으로 감싸는 이유는 안정성 때문이 아니라, 렌더 중에 ref 를 건드리는
  // 것으로 오해받지 않기 위해서다(react-hooks/refs). 실제 접근은 이벤트 때 일어난다.
  const cancelClose = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }, [])
  const openByPointer = React.useCallback(() => {
    cancelClose()
    openedByPointer.current = true
    setPopoverOpen(true)
  }, [cancelClose])
  // 살짝 늦춰 닫아, 트리거에서 팝오버로 커서를 옮기는 사이에 닫히지 않게 한다.
  const scheduleClose = React.useCallback(() => {
    cancelClose()
    closeTimer.current = setTimeout(() => setPopoverOpen(false), 150)
  }, [cancelClose])

  React.useEffect(() => cancelClose, [cancelClose])

  const triggerClass = cn("group/submenu", sidebarNavItemClass, className)
  const triggerInner = (
    <>
      {icon}
      <span>{label}</span>
      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/submenu:rotate-180 group-data-collapsed/shell:hidden" />
    </>
  )

  if (iconMode) {
    return (
      <li data-slot="sidebar-nav-submenu">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-slot="sidebar-nav-submenu-trigger"
              data-active={active || undefined}
              className={triggerClass}
              onPointerEnter={openByPointer}
              onPointerLeave={scheduleClose}
              {...props}
            >
              {triggerInner}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-52 p-1"
            onPointerEnter={cancelClose}
            onPointerLeave={scheduleClose}
            onOpenAutoFocus={(event) => {
              // hover 로 열렸으면 포커스를 가져오지 않는다.
              if (openedByPointer.current) event.preventDefault()
              openedByPointer.current = false
            }}
          >
            <div className="truncate px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {label}
            </div>
            <ul className="flex flex-col gap-0.5">{children}</ul>
          </PopoverContent>
        </Popover>
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
        <CollapsibleTrigger asChild>
          <button
            type="button"
            data-slot="sidebar-nav-submenu-trigger"
            data-active={active || undefined}
            className={triggerClass}
            {...props}
          >
            {triggerInner}
          </button>
        </CollapsibleTrigger>
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
