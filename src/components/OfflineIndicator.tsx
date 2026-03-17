import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50">
      <Badge variant="destructive" className="shadow-lg flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        You're offline. Some features may be limited.
      </Badge>
    </div>
  );
}