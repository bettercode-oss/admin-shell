"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useShellState } from "./shell-context"

/**
 * 사이드바 접기/펼치기 버튼. SidebarHeaderActions 안에 넣는 것을 전제로 한다.
 * 라벨은 화면에 읽히는 문구라 props 로 덮어쓸 수 있게 열어둔다.
 */
function SidebarCollapseToggle({
  collapseLabel = "사이드바 접기",
  expandLabel = "사이드바 펼치기",
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
          aria-label={label}
          aria-expanded={!collapsed}
          aria-controls="admin-shell-sidebar"
          onClick={(event) => {
            onClick?.(event)
            if (!event.defaultPrevented) toggleCollapsed()
          }}
          {...props}
        >
          <PanelLeft />
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
 * 이 컴포넌트가 sidebar.tsx 에서 유일하게 클라이언트인 부분인 이유다.
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
