# admin-shell
특정 프로젝트 로직이 전혀 없는 순수 레이아웃/UI 셸

## Layout

AdminShell은 Sidebar + Topbar + Content 3영역 그리드 레이아웃입니다.

```
┌──────────┬─────────────────────┐
│          │       Topbar        │
│ Sidebar  ├─────────────────────┤
│          │   Content (scroll)  │
└──────────┴─────────────────────┘
```

```tsx
<AdminShell>
  <Sidebar>...</Sidebar>
  <Topbar>...</Topbar>
  <ShellContent>...</ShellContent>
</AdminShell>
```

Sidebar와 Topbar는 고정되고 ShellContent 영역만 스크롤됩니다.
폭과 높이는 CSS 변수로 노출되어 있어 소비하는 쪽에서 덮어쓸 수 있습니다.

```
--admin-shell-sidebar-width: 16rem
--admin-shell-topbar-height: 3.5rem
```
