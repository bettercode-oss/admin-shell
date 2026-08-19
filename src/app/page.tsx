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
  ShellContent,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  Topbar,
  TopbarActions,
} from "@/components/admin-shell"
import { Button } from "@/components/ui/button"

/**
 * 컴포넌트 프리뷰/데모. 실제 제품 데이터가 아니라 하드코딩한 더미다.
 * 활성 항목은 라우터가 아니라 active prop 으로 주입한다는 점을 보여준다.
 */
const nav = [
  { label: "대시보드", href: "/", icon: LayoutDashboard, active: true },
  { label: "사용자", href: "/users", icon: Users },
  { label: "콘텐츠", href: "/contents", icon: FileText },
  { label: "통계", href: "/stats", icon: BarChart3 },
  { label: "설정", href: "/settings", icon: Settings },
]

export default function Page() {
  return (
    <AdminShell>
      <Sidebar>
        <SidebarHeader>admin-shell</SidebarHeader>

        <SidebarNav aria-label="주요 메뉴">
          {nav.map(({ label, href, icon: Icon, active }) => (
            <SidebarNavItem key={href} icon={<Icon />} active={active} asChild>
              <Link href={href}>
                <span>{label}</span>
              </Link>
            </SidebarNavItem>
          ))}
        </SidebarNav>

        <SidebarFooter>
          <span className="truncate text-xs text-sidebar-foreground/60">
            v0.1.0
          </span>
        </SidebarFooter>
      </Sidebar>

      <Topbar title="대시보드">
        <TopbarActions>
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
    </AdminShell>
  )
}
