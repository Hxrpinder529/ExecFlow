import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS
    const ua = window.navigator.userAgent;
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const webkit = !!ua.match(/WebKit/i);
    const iOSStandalone = !!(window.navigator as any).standalone;
    
    setIsIOS(iOS && webkit && !iOSStandalone);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  if (isStandalone || (!showPrompt && !isIOS)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <Card className="p-4 shadow-lg border-primary/20">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Install ExecFlow</h4>
            
            {isIOS ? (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  Install this app on your iPhone for a better experience:
                </p>
                <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Tap the share button <span className="font-mono">⎙</span></li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Install ExecFlow on your device for quick access and offline support.
                </p>
                <Button size="sm" onClick={handleInstallClick} className="w-full">
                  <Download className="h-3 w-3 mr-2" />
                  Install App
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}