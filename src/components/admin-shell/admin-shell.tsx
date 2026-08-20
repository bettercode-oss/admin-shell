import * as React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { ShellRoot } from "./shell-context"

/**
 * 셸 전체 치수. CSS 변수로 노출하므로 소비자가 style 로 덮어쓸 수 있다.
 *
 * 인라인 style 로 선언되는 점이 중요하다 — 인라인은 클래스보다 항상 우선하므로
 * 접기는 이 변수 값을 바꾸는 방식이 될 수 없다. 아래 grid 정의 교체를 참고.
 */
const shellVars = {
  "--admin-shell-sidebar-width": "16rem",
  "--admin-shell-sidebar-width-collapsed": "4rem",
  "--admin-shell-topbar-height": "3.5rem",
  // 활성 항목 배경을 전경색 쪽으로 얼마나 섞을지. 값만 바꾸면 즉시 반영된다.
  "--admin-shell-active-mix": "3%",
} as React.CSSProperties

function AdminShell({
  className,
  style,
  ...props
}: React.ComponentProps<typeof ShellRoot>) {
  return (
    <TooltipProvider>
      <ShellRoot
        style={{ ...shellVars, ...style }}
        className={cn(
          "group/shell grid h-svh w-full bg-background text-foreground",
          "grid-cols-[var(--admin-shell-sidebar-width)_1fr]",
          "grid-rows-[var(--admin-shell-topbar-height)_minmax(0,1fr)]",
          "[grid-template-areas:'sidebar_topbar''sidebar_content']",
          // 접힘. 인라인 style 과 충돌하지 않도록 폭 변수가 아니라 그리드 정의를 바꾼다.
          "data-collapsed:grid-cols-[var(--admin-shell-sidebar-width-collapsed)_1fr]",
          // 좁은 화면에서는 사이드바가 드로어로 빠지므로 칸 자체를 없앤다
          "max-md:grid-cols-[minmax(0,1fr)]",
          "max-md:[grid-template-areas:'topbar''content']",
          "transition-[grid-template-columns] duration-200 ease-out",
          "motion-reduce:transition-none",
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
