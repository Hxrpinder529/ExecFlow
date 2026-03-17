import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationCenter } from "./NotificationCenter";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  const { user } = useApp();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <SidebarTrigger />
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <ThemeToggle />
          
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
      </div>
    </header>
  );
}