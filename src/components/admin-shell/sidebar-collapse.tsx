"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { useShellState } from "./shell-context"

/**
 * 사이드바 접기/펼치기 버튼. SidebarHeaderActions 안에 넣는 것을 전제로 한다.
 * 라벨은 화면에 읽히는 문구라 props 로 덮어쓸 수 있게 열어둔다.
 *
 * 아이콘은 children 의 기본값이라 그대로 덮어쓸 수 있다. lucide 가 아닌 아이콘
 * 세트를 쓰는 프로젝트도 컴포넌트를 복사해 고칠 필요가 없다.
 *
 *   <SidebarCollapseToggle><Bars3Icon className="size-4" /></SidebarCollapseToggle>
 *
 * 접힘/펼침에 따라 아이콘을 바꾸고 싶으면 useShellState() 로 소비자가 만든다 —
 * 상태별 아이콘 prop 을 따로 두지 않는다.
 */
function SidebarCollapseToggle({
  className,
  collapseLabel = "사이드바 접기",
  expandLabel = "사이드바 펼치기",
  // children 을 구조 분해로 빼내는 것이 핵심이다. props 에 남겨두면 아래 JSX 자식이
  // props.children 을 덮어써서, 소비자가 넘긴 아이콘이 조용히 무시된다.
  children = <PanelLeft />,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & {
  collapseLabel?: string
  expandLabel?: string
}) {
  const { collapsed, toggleCollapsed } = useShellState()
  const label = collapsed ? expandLabel : collapseLabel

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="sidebar-collapse-toggle"
          variant="ghost"
          size="icon-sm"
          // 좁은 화면에서는 사이드바가 드로어라 접을 대상이 없다
          className={cn("max-md:hidden", className)}
          aria-label={label}
          aria-expanded={!collapsed}
          aria-controls="admin-shell-sidebar"
          onClick={(event) => {
            onClick?.(event)
            if (!event.defaultPrevented) toggleCollapsed()
          }}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

/**
 * 접힌 상태에서만 툴팁을 붙인다. 펼친 상태에서는 children 을 그대로 통과시켜
 * 불필요한 Radix 트리를 만들지 않는다.
 *
 * 툴팁 내용은 포털로 body 에 렌더되므로 CSS 만으로는 접힘 상태를 알 수 없다.
 * 접힘을 group-data-collapsed/shell 변형으로 처리하는 다른 부분과 달리 이 조각만
 * 클라이언트여야 하는 이유다. sidebar.tsx 는 이것과 SidebarFrame 을 빌려 쓰면서도
 * 자신은 서버 컴포넌트로 남는다.
 */
function SidebarTooltip({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) {
  const { collapsed } = useShellState()

  if (!collapsed) return children

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export { SidebarCollapseToggle, SidebarTooltip }
