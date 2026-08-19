import * as React from "react"

import { cn } from "@/lib/utils"

function Topbar({
  className,
  title,
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  /** 편의용. 더 자유롭게 조립하려면 <TopbarTitle> 을 직접 넣으면 된다. */
  title?: React.ReactNode
}) {
  return (
    <header
      data-slot="topbar"
      className={cn(
        "[grid-area:topbar] flex h-(--admin-shell-topbar-height) items-center gap-3 border-b border-border bg-background px-4",
        className
      )}
      {...props}
    >
      {title ? <TopbarTitle>{title}</TopbarTitle> : null}
      {children}
    </header>
  )
}

function TopbarTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="topbar-title"
      className={cn("truncate text-base font-semibold", className)}
      {...props}
    />
  )
}

function TopbarActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="topbar-actions"
      className={cn("ml-auto flex items-center gap-2", className)}
      {...props}
    />
  )
}

export { Topbar, TopbarTitle, TopbarActions }
