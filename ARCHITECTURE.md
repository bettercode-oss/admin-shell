# Architecture

## Grid Structure

```
grid-template-areas: "sidebar topbar" "sidebar content"
```

## CSS Variables

```
--admin-shell-sidebar-width
--admin-shell-topbar-height
```

(2단계에서 값만 바꾸면 접기/펼치기 — JS 리렌더 없음)

## Component Tree

```
AdminShell
├── Sidebar (SidebarHeader / SidebarNav / SidebarNavItem / SidebarFooter)
├── Topbar (TopbarTitle / TopbarActions)
└── ShellContent (children, min-h-0 overflow-y-auto)
```

## 확장 시 주의점

- Sidebar/Topbar는 서버 컴포넌트로 유지 (상태 필요시 얇은 client Provider만 내부에 추가)
- 라우팅 비의존: Slot 기반 asChild 패턴으로 `<a>` / `<Link>` 주입은 소비자 책임
