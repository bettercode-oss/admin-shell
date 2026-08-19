import * as React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * 셸 전체 치수. CSS 변수로 노출하므로 소비자가 style 로 덮어쓸 수 있고,
 * 접기 애니메이션도 변수 값 전환만으로 처리된다.
 */
const shellVars = {
  "--admin-shell-sidebar-width": "16rem",
  "--admin-shell-topbar-height": "3.5rem",
  // 활성 항목 배경을 전경색 쪽으로 얼마나 섞을지. 값만 바꾸면 즉시 반영된다.
  "--admin-shell-active-mix": "3%",
} as React.CSSProperties

function AdminShell({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <TooltipProvider>
      <div
        data-slot="admin-shell"
        style={{ ...shellVars, ...style }}
        className={cn(
          "grid h-svh w-full bg-background text-foreground",
          "grid-cols-[var(--admin-shell-sidebar-width)_1fr]",
          "grid-rows-[var(--admin-shell-topbar-height)_minmax(0,1fr)]",
          "[grid-template-areas:'sidebar_topbar''sidebar_content']",
          className
        )}
        {...props}
      />
    </TooltipProvider>
  )
}

function ShellContent({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="shell-content"
      className={cn(
        "[grid-area:content] min-h-0 overflow-y-auto p-6",
        className
      )}
      {...props}
    />
  )
}

export { AdminShell, ShellContent }
