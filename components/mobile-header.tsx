"use client";

import { Package, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface MobileHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileHeader({ activeTab, onTabChange }: MobileHeaderProps) {
  const [showLowStockDialog, setShowLowStockDialog] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
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
    return () => clearInterval(lowStockInterval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary rounded-md md:p-2">
              <Package className="h-4 w-4 text-primary-foreground md:h-5 md:w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground md:text-xl">
                Sistema de Estoque
              </h1>
              <p className="text-xs text-muted-foreground hidden md:block">
                Gestão Empresarial
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">Minha Empresa</p>
            <p className="text-xs text-muted-foreground">Versão Mobile</p>
          </div>
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
