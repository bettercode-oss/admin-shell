import Link from "next/link"
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"

import {
  AdminShell,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
  CommandPaletteTrigger,
  CommandSeparator,
  CommandShortcut,
  ShellContent,
  Sidebar,
  SidebarCollapseToggle,
  SidebarGroup,
  SidebarFooter,
  SidebarHeader,
  SidebarHeaderActions,
  SidebarHeaderTitle,
  SidebarNav,
  SidebarNavItem,
  SidebarNavSubmenu,
  Topbar,
  TopbarActions,
  TopbarMenuButton,
  TopbarNav,
  TopbarNavItem,
  TopbarTitle,
} from "@/components/admin-shell"
import { Button } from "@/components/ui/button"

import { ThemeToggle } from "./theme-toggle"

/**
 * 컴포넌트 프리뷰/데모. 실제 제품 데이터가 아니라 하드코딩한 더미다.
 * 활성 항목은 라우터가 아니라 active prop 으로 주입한다는 점을 보여준다.
 */

export default function Page() {
  return (
    <AdminShell>
      <Sidebar>
        <SidebarHeader>
          <SidebarHeaderTitle>admin-shell</SidebarHeaderTitle>
          <SidebarHeaderActions>
            <CommandPaletteTrigger />
            <SidebarCollapseToggle />
          </SidebarHeaderActions>
        </SidebarHeader>

        <SidebarNav aria-label="주요 메뉴">
          <SidebarGroup>
            <SidebarNavItem
              icon={<LayoutDashboard />}
              tooltip="대시보드"
              asChild
            >
              <Link href="/">
                <span>대시보드</span>
              </Link>
            </SidebarNavItem>
          </SidebarGroup>

          <SidebarGroup label="운영">
            <SidebarNavSubmenu icon={<Users />} label="사용자" active defaultOpen>
              <SidebarNavItem active asChild>
                <Link href="/users">
                  <span>목록</span>
                </Link>
              </SidebarNavItem>
              <SidebarNavItem asChild>
                <Link href="/users/new">
                  <span>추가</span>
                </Link>
              </SidebarNavItem>
              <SidebarNavItem asChild>
                <Link href="/users/roles">
                  <span>권한</span>
                </Link>
              </SidebarNavItem>
            </SidebarNavSubmenu>

            <SidebarNavItem icon={<FileText />} tooltip="콘텐츠" asChild>
              <Link href="/contents">
                <span>콘텐츠</span>
              </Link>
            </SidebarNavItem>
            <SidebarNavItem icon={<BarChart3 />} tooltip="통계" asChild>
              <Link href="/stats">
                <span>통계</span>
              </Link>
            </SidebarNavItem>
          </SidebarGroup>

          <SidebarGroup label="설정">
            <SidebarNavItem icon={<Settings />} tooltip="설정" asChild>
              <Link href="/settings">
                <span>설정</span>
              </Link>
            </SidebarNavItem>
          </SidebarGroup>
        </SidebarNav>

        <SidebarFooter>
          <span className="truncate text-xs text-sidebar-foreground/60">
            v0.1.0
          </span>
        </SidebarFooter>
      </Sidebar>

      <Topbar>
        <TopbarMenuButton />
        <TopbarTitle>사용자</TopbarTitle>

        {/* 사이드바에서 펼쳐진 "사용자" 가지를 그대로 옆으로 편 것. 같은 링크가
            사이드바에도 트리로 남아 있고, 접었을 때는 이쪽이 대신 보여준다. */}
        <TopbarNav aria-label="사용자">
          <TopbarNavItem active asChild>
            <Link href="/users">목록</Link>
          </TopbarNavItem>
          <TopbarNavItem asChild>
            <Link href="/users/new">추가</Link>
          </TopbarNavItem>
          <TopbarNavItem asChild>
            <Link href="/users/roles">권한</Link>
          </TopbarNavItem>
        </TopbarNav>

        <TopbarActions>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="알림">
            <Bell />
          </Button>
          <Button variant="outline" size="sm">
            새로고침
          </Button>
        </TopbarActions>
      </Topbar>

      <ShellContent>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            사이드바와 토프바는 고정되고 이 본문 영역만 스크롤된다.
          </p>
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 text-sm text-card-foreground"
            >
              스크롤 확인용 카드 {i + 1}
            </div>
          ))}
        </div>
      </ShellContent>

      <CommandPalette>
        <CommandInput placeholder="메뉴 검색..." />
        <CommandList>
          <CommandEmpty>결과가 없습니다.</CommandEmpty>
          <CommandGroup heading="메뉴">
            <CommandItem>대시보드</CommandItem>
            <CommandItem>사용자</CommandItem>
            <CommandItem>콘텐츠</CommandItem>
            <CommandItem>통계</CommandItem>
            <CommandItem>설정</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="작업">
            <CommandItem>
              새 사용자 추가
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandPalette>
    </AdminShell>
  )
}
