"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Building2,
  LogOut,
  Settings,
  User,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function Header() {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [showLowStockDialog, setShowLowStockDialog] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Polling para estoque baixo
    const fetchLowStock = () => {
      fetch("/api/dashboard", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          setLowStockProducts(data.lowStockProducts || []);
        });
    };
    fetchLowStock(); // Chamada inicial
    const lowStockInterval = setInterval(fetchLowStock, 10000); // 10 segundos

    return () => {
      clearInterval(timer);
      clearInterval(lowStockInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!session) return null;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 w-full">
        {/* Grupo da esquerda: título e status */}
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            Sistema de Estoque
          </h1>
          <div className="hidden lg:flex items-center space-x-2 ml-4">
            <Badge
              variant={isOnline ? "default" : "destructive"}
              className="text-xs"
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {currentTime.toLocaleDateString("pt-BR")}{" "}
              {currentTime.toLocaleTimeString("pt-BR")}
            </span>
          </div>
        </div>

        {/* Grupo da direita: usuário, tema, avatar, sair */}
        <div className="flex items-center space-x-4">
          {/* Ícone de aviso de estoque baixo */}
          <button
            type="button"
            className="relative"
            onClick={() => setShowLowStockDialog(true)}
            aria-label="Aviso de estoque baixo"
            disabled={lowStockProducts.length === 0}
          >
            <AlertCircle
              className={`h-6 w-6 ${
                lowStockProducts.length > 0
                  ? "text-yellow-500 animate-bounce"
                  : "text-muted-foreground"
              }`}
              strokeWidth={2.2}
            />
            {lowStockProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          {/* Toggle de tema */}
          <ThemeToggle />

          {/* Dialog de estoque baixo */}
          <Dialog
            open={showLowStockDialog}
            onOpenChange={setShowLowStockDialog}
          >
            <DialogContent>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Produtos com Estoque Baixo
              </h2>
              {lowStockProducts.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhum produto com estoque baixo.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="py-1 pr-2">Nome</th>
                        <th className="py-1 pr-2">Categoria</th>
                        <th className="py-1 pr-2">Tamanho</th>
                        <th className="py-1 pr-2">Qtd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((prod, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-1 pr-2 font-medium">{prod.name}</td>
                          <td className="py-1 pr-2">{prod.category}</td>
                          <td className="py-1 pr-2">{prod.size || "-"}</td>
                          <td className="py-1 pr-2">{prod.stockQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Informações do usuário */}
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-foreground">
              {session?.user?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(session?.user as any)?.company}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {(session?.user as any)?.role}
            </p>
          </div>

          {/* Avatar e menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {(session?.user as any)?.role}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {(session?.user as any)?.company}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
