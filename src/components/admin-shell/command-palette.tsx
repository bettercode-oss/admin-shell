"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandDialog } from "@/components/ui/command"

import { useShellState } from "./shell-context"

/**
 * 커맨드 팔레트의 **틀**만 제공한다. 무엇을 검색하고 결과를 어떻게 그릴지는 전부
 * 소비자 몫이다 — 결과를 콜백으로 받으면 그 데이터 모양이 라이브러리 계약이 되어
 * "제품 데이터 타입을 두지 않는다" 는 원칙이 깨진다.
 *
 *   <CommandPalette>
 *     <CommandInput placeholder="검색..." />
 *     <CommandList>
 *       <CommandEmpty>결과가 없습니다.</CommandEmpty>
 *       <CommandGroup heading="메뉴">
 *         <CommandItem onSelect={() => router.push("/users")}>사용자</CommandItem>
 *       </CommandGroup>
 *     </CommandList>
 *   </CommandPalette>
 *
 * 열림 상태는 셸이 들고 있어 CommandPaletteTrigger 와 배선 없이 이어진다.
 * open / onOpenChange 를 주면 제어 모드로 바뀐다.
 *
 * children 을 <Command> 로 감싸는 것이 중요하다. shadcn 의 CommandDialog 는 children 을
 * 그대로 DialogContent 에 넣기만 해서, CommandInput 이 cmdk 컨텍스트 없이 마운트되면
 * "Cannot read properties of undefined (reading 'subscribe')" 로 앱이 죽는다.
 */
function CommandPalette({
  open: openProp,
  onOpenChange,
  title = "커맨드 팔레트",
  description = "검색어를 입력하세요",
  shortcut = true,
  children,
  ...props
}: React.ComponentProps<typeof CommandDialog> & {
  /** ⌘K / Ctrl+K 로 여닫기. 끄려면 false. */
  shortcut?: boolean
}) {
  const { searchOpen, setSearchOpen } = useShellState()
  const open = openProp ?? searchOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setSearchOpen(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange, setSearchOpen]
  )

  React.useEffect(() => {
    if (!shortcut) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcut, open, setOpen])

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      {...props}
    >
      <Command>{children}</Command>
    </CommandDialog>
  )
}

/**
 * 팔레트를 여는 아이콘 버튼. 사이드바 헤더든 토프바든 원하는 곳에 둔다.
 * 아이콘은 children 기본값이라 그대로 덮어쓸 수 있다.
 */
function CommandPaletteTrigger({
  className,
  label = "검색",
  children = <Search />,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & { label?: string }) {
  const { setSearchOpen } = useShellState()

  return (
    <Button
      data-slot="command-palette-trigger"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      className={className}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setSearchOpen(true)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export { CommandPalette, CommandPaletteTrigger }
