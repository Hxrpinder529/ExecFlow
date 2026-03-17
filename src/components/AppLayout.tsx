import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Heart } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="min-h-full flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              
              <footer className="mt-12 flex justify-center">
                <div className="bg-black/5 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full px-6 py-2 shadow-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    Crafted with 
                    <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> 
                    by Harpinder Singh
                  </p>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}