"use client"

import * as React from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { useIsMobile, useShellState } from "./shell-context"

/**
 * 사이드바의 바깥 껍데기. 데스크톱에서는 그리드 칸을 차지하는 <aside> 이고,
 * 좁은 화면에서는 Sheet(Radix Dialog) 안으로 들어간다.
 *
 * 포커스 트랩 · ESC 닫기 · 바깥 클릭 닫기 · 스크롤 잠금은 Radix 가 처리하므로
 * 직접 구현하지 않는다.
 *
 * sidebar.tsx 를 서버 컴포넌트로 유지하기 위해 분기만 여기로 뺐다.
 */
function SidebarFrame({
  className,
  id = "admin-shell-sidebar",
  mobileLabel = "메뉴",
  children,
  ...props
}: React.ComponentProps<"aside"> & { mobileLabel?: string }) {
  const isMobile = useIsMobile()
  const { mobileOpen, setMobileOpen } = useShellState()

  const inner = (
    <aside
      id={id}
      data-slot="sidebar"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground",
        // 드로어 안에서는 그리드 칸도 오른쪽 테두리도 필요 없다.
        // 대신 SheetContent 가 flex 컨테이너라 flex-1 을 줘야 세로로 꽉 찬다.
        isMobile ? "flex-1" : "[grid-area:sidebar] border-r border-sidebar-border",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          // 폭을 인라인 style 로 준다. 클래스로 주면 shadcn 의
          // data-[side=left]:w-3/4 가 특이도에서 이겨 75% 로 벌어진다.
          //
          // 포털로 body 에 렌더되어 셸 루트의 CSS 변수를 물려받지 못하므로
          // 실제로 쓰이는 값은 폴백 16rem 이다.
          style={{ width: "var(--admin-shell-sidebar-width, 16rem)" }}
          className="max-w-[85%] gap-0 p-0"
        >
          <SheetTitle className="sr-only">{mobileLabel}</SheetTitle>
          {inner}
        </SheetContent>
      </Sheet>
    )
  }

  return inner
}

/**
 * 모바일 드로어를 여는 햄버거 버튼. 데스크톱에서는 스스로 숨는다.
 * 아이콘은 children 기본값이라 그대로 덮어쓸 수 있다.
 */
function TopbarMenuButton({
  className,
  label = "메뉴 열기",
  children = <Menu />,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & { label?: string }) {
  const { setMobileOpen } = useShellState()

  return (
    <Button
      data-slot="topbar-menu-button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-controls="admin-shell-sidebar"
      className={cn("md:hidden", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setMobileOpen(true)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export { SidebarFrame, TopbarMenuButton }
