"use client"

import * as React from "react"

type ShellContextValue = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

const ShellContext = React.createContext<ShellContextValue | null>(null)

/**
 * Provider 없이도 동작한다. 훅은 항상 같은 순서로 호출하고 Context 가 있을 때만
 * 그 값을 쓴다 — 파일 단위로 복사해간 프로젝트에서 컴포넌트가 스스로 상태를 들고
 * 동작하게 하기 위한 장치다.
 */
function useShellState(): ShellContextValue {
  const context = React.useContext(ShellContext)
  const [collapsed, setCollapsed] = React.useState(false)

  const fallback = React.useMemo<ShellContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed: () => setCollapsed((previous) => !previous),
    }),
    [collapsed]
  )

  return context ?? fallback
}

/**
 * 상태를 들고 있는 얇은 클라이언트 경계. 레이아웃 클래스는 서버 컴포넌트인
 * AdminShell 이 계산해 넘기고, 여기서는 상태와 data-collapsed 만 얹는다.
 * children 은 그대로 통과하므로 Sidebar/Topbar 는 서버 컴포넌트로 남는다.
 */
function ShellRoot({
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  ...props
}: React.ComponentProps<"div"> & {
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultCollapsed)
  const collapsed = collapsedProp ?? uncontrolled

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (collapsedProp === undefined) setUncontrolled(next)
      onCollapsedChange?.(next)
    },
    [collapsedProp, onCollapsedChange]
  )

  const value = React.useMemo<ShellContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed: () => setCollapsed(!collapsed),
    }),
    [collapsed, setCollapsed]
  )

  return (
    <ShellContext.Provider value={value}>
      <div
        data-slot="admin-shell"
        data-collapsed={collapsed || undefined}
        {...props}
      />
    </ShellContext.Provider>
  )
}

export { ShellRoot, useShellState, type ShellContextValue }
