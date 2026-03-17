import { LayoutDashboard, ClipboardList, RefreshCw, Calendar, FileText, Settings, LogOut, Heart } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useApp } from "@/context/AppContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Task Register", url: "/tasks", icon: ClipboardList },
  { title: "Follow-Up Tracker", url: "/follow-ups", icon: RefreshCw },
  { title: "Project Timeline", url: "/projects", icon: Calendar },
  { title: "Weekly Report", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout, user } = useApp();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`p-4 ${collapsed ? "px-2" : ""}`}>
          <div className={`flex items-center justify-center ${collapsed ? "px-0" : ""}`}>
            <img 
              src="/logo.png" 
              alt="ExecFlow" 
              className="h-20 object-contain"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-semibold text-sidebar-primary">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-sidebar-foreground truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-sidebar-foreground/50">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="mb-3 px-1">
            <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5">
              <p className="text-[10px] text-sidebar-foreground/60 flex items-center justify-center gap-1">
                Crafted with 
                <Heart className="h-2.5 w-2.5 text-red-500 fill-red-500 animate-pulse" /> 
                by HS
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center mb-2">
            <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full p-1.5">
              <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="hover:bg-destructive/20 text-sidebar-foreground/70 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}