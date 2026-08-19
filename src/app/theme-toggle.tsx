"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * 데모 전용 테마 토글.
 *
 * 이 프로젝트의 테마는 `.dark` 클래스 기반(globals.css 의
 * `@custom-variant dark (&:is(.dark *))`)이라, 클래스를 붙이고 떼는 주체가 필요하다.
 * 그건 셸 라이브러리가 아니라 소비 제품의 책임이므로 admin-shell 밖에 둔다.
 * 실제 제품에서는 next-themes 같은 것을 쓰면 된다.
 *
 * 상태를 따로 두지 않고 `<html>` 의 클래스를 단일 소스로 읽는다.
 * 서버 스냅샷은 항상 false 이므로 하이드레이션 불일치가 없다.
 */
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

const isDark = () => document.documentElement.classList.contains("dark")

export function ThemeToggle() {
  const dark = React.useSyncExternalStore(subscribe, isDark, () => false)

  // 초기값은 OS 설정을 따른다. DOM 만 건드리면 위 스토어가 알아서 갱신된다.
  React.useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      window.matchMedia("(prefers-color-scheme: dark)").matches
    )
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => document.documentElement.classList.toggle("dark")}
      aria-pressed={dark}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  )
}
