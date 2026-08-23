export { AdminShell, ShellContent } from "./admin-shell"
export {
  useShellState,
  useIsMobile,
  type ShellContextValue,
} from "./shell-context"
export { TopbarMenuButton } from "./mobile-drawer"
export { SidebarNavSubmenu } from "./sidebar-submenu"
export { CommandPalette, CommandPaletteTrigger } from "./command-palette"

// 팔레트 내용을 조립할 때 쓰는 shadcn command 조각들. 한곳에서 import 하도록 다시 내보낸다.
export {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
export { SidebarCollapseToggle } from "./sidebar-collapse"
export {
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarHeaderActions,
  SidebarNav,
  SidebarNavItem,
  SidebarFooter,
} from "./sidebar"
export {
  Topbar,
  TopbarTitle,
  TopbarNav,
  TopbarNavItem,
  TopbarActions,
} from "./topbar"
