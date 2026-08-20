/**
 * 메뉴 행(leaf 항목과 중첩 메뉴 트리거)이 공유하는 클래스.
 * sidebar.tsx 와 sidebar-submenu.tsx 가 함께 쓰므로 별도 모듈로 뺐다 —
 * 서로 import 하면 순환이 된다.
 */
const sidebarNavItemClass = [
  "flex h-9 w-full items-center gap-2.5 overflow-hidden rounded-md px-2.5 text-sm whitespace-nowrap text-sidebar-foreground/80 outline-none transition-colors",
  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  "focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
  // 활성 배경은 --sidebar-accent 를 전경색 쪽으로 섞어 만든다. 섞는 비율은
  // --admin-shell-active-mix 로 조정한다(AdminShell 이 3% 로 선언).
  // 폴백 3% 를 둔 이유는 이 파일만 복사해가도 동작해야 하기 때문이다 —
  // 변수가 없으면 color-mix 전체가 무효가 되어 배경이 아예 사라진다.
  "data-active:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_var(--admin-shell-active-mix,3%))] data-active:font-medium data-active:text-sidebar-accent-foreground",
  // 접힘: 아이콘만 남기고 가운데 정렬
  "group-data-collapsed/shell:justify-center group-data-collapsed/shell:gap-0 group-data-collapsed/shell:px-0",
  "group-data-collapsed/shell:[&>span]:hidden",
  "[&>span]:truncate [&_svg]:size-4 [&_svg]:shrink-0",
].join(" ")

export { sidebarNavItemClass }
