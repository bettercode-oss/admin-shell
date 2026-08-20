"use client"

import * as React from "react"

type ShellContextValue = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
  /** 모바일 드로어 열림 여부. 데스크톱에서는 쓰이지 않는다. */
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  /** 커맨드 팔레트 열림 여부. 트리거와 팔레트를 배선 없이 잇기 위해 셸이 들고 있다. */
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

/** 이 폭 미만에서 사이드바가 그리드에서 빠지고 드로어로 바뀐다 (Tailwind md). */
const MOBILE_QUERY = "(max-width: 767px)"

/**
 * 서버 스냅샷은 항상 false(데스크톱)라 하이드레이션 불일치가 없다.
 * useState + useEffect 대신 useSyncExternalStore 를 쓰는 이유는 그것이
 * react-hooks/set-state-in-effect 규칙에 걸리기 때문이기도 하다.
 */
function useIsMobile() {
  return React.useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(MOBILE_QUERY)
      query.addEventListener("change", onChange)
      return () => query.removeEventListener("change", onChange)
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
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
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  const fallback = React.useMemo<ShellContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed: () => setCollapsed((previous) => !previous),
      mobileOpen,
      setMobileOpen,
      searchOpen,
      setSearchOpen,
    }),
    [collapsed, mobileOpen, searchOpen]
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
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
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
      mobileOpen,
      setMobileOpen,
      searchOpen,
      setSearchOpen,
    }),
    [collapsed, setCollapsed, mobileOpen, searchOpen]
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

export { ShellRoot, useShellState, useIsMobile, type ShellContextValue }
