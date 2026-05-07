import { useState, useEffect } from "react";
import { Download, Smartphone, Check, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(isStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-2">
          <Smartphone className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Instalar Viral LinkedIn AI</h1>
          <p className="text-muted-foreground">
            Tenha o app na sua tela inicial para acesso rápido
          </p>
        </div>

        {isInstalled ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <Check className="w-10 h-10 mx-auto text-primary" />
              <p className="font-medium">App já está instalado!</p>
              <p className="text-sm text-muted-foreground">
                Abra pela sua tela inicial para a melhor experiência.
              </p>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como instalar no iPhone/iPad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 shrink-0">
                  <Share className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">1. Toque em "Compartilhar"</p>
                  <p className="text-sm text-muted-foreground">
                    O ícone de compartilhamento na barra do Safari
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 shrink-0">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">2. "Adicionar à Tela de Início"</p>
                  <p className="text-sm text-muted-foreground">
                    Role para baixo e toque nessa opção
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">3. Confirme tocando "Adicionar"</p>
                  <p className="text-sm text-muted-foreground">
                    Pronto! O app aparecerá na sua tela inicial
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground">
                Instale o app para usar offline e ter acesso rápido.
              </p>
              <Button onClick={handleInstall} size="lg" className="gap-2">
                <Download className="w-4 h-4" />
                Instalar agora
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <p className="text-muted-foreground">
                Use o menu do navegador para adicionar à tela inicial.
              </p>
              <p className="text-xs text-muted-foreground">
                No Chrome: Menu (⋮) → "Instalar app" ou "Adicionar à tela inicial"
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Install;
