import { Bell, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export function AppHeader() {
  const { user, theme, setTheme, tasks } = useApp();
  const today = new Date().toISOString().split("T")[0];
  const overdueCount = useMemo(() => {
    return tasks.filter(
      (t) => t.status !== "Completed" && t.dueDate < today
    ).length;
  }, [tasks, today]);

  const dueTodayCount = useMemo(() => {
    return tasks.filter(
      (t) => t.status !== "Completed" && t.dueDate === today
    ).length;
  }, [tasks, today]);

  const notifCount = overdueCount + dueTodayCount;

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-sm font-semibold text-foreground hidden sm:block">
          ExecFlow — Task Delegation & Follow-up Tracker
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {notifCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] bg-destructive text-destructive-foreground">
              {notifCount}
            </Badge>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title="Toggle theme"
        >
          {theme === "light"
            ? <Moon className="h-4 w-4" />
            : <Sun className="h-4 w-4" />}
        </Button>

        {user && (
          <div className="flex items-center gap-2 ml-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user.name.charAt(0)}
            </div>
            <span className="text-sm font-medium hidden md:block">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}