"use client";

import { Package, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/shared/mobile-nav";
import { Dialog, DialogContent } from "@/components/shared/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";

interface MobileHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileHeader({ activeTab, onTabChange }: MobileHeaderProps) {
  const [showLowStockDialog, setShowLowStockDialog] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [lowStockCompanies, setLowStockCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    // Polling para estoque baixo
    const fetchLowStock = () => {
      fetch("/api/dashboard", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          setLowStockProducts(data.lowStockProducts || []);
          // Agrupar produtos por empresa
          const companiesMap = new Map();
          (data.lowStockProducts || []).forEach((product: any) => {
            const companyName = product.company || "Produção Interna";
            if (!companiesMap.has(companyName)) {
              companiesMap.set(companyName, {
                name: companyName,
                products: [],
                count: 0,
              });
            }
            const company = companiesMap.get(companyName);
            company.products.push(product);
            company.count++;
          });
          setLowStockCompanies(Array.from(companiesMap.values()));
        });
    };
    fetchLowStock(); // Chamada inicial
    const lowStockInterval = setInterval(fetchLowStock, 10000); // 10 segundos
    return () => clearInterval(lowStockInterval);
  }, []);

  const handleCompanyClick = (company: any) => {
    setSelectedCompany(company);
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
  };

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
            disabled={lowStockCompanies.length === 0}
          >
            <AlertCircle
              className={`h-6 w-6 ${
                lowStockCompanies.length > 0
                  ? "text-yellow-500 animate-bounce"
                  : "text-muted-foreground"
              }`}
              strokeWidth={2.2}
            />
            {lowStockCompanies.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                {lowStockCompanies.length}
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
                {selectedCompany
                  ? `${selectedCompany.name} - Produtos com Estoque Baixo`
                  : "Empresas com Estoque Baixo"}
              </h2>
              {lowStockCompanies.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhuma empresa com estoque baixo.
                </p>
              ) : selectedCompany ? (
                <div className="max-h-60 overflow-y-auto">
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackToCompanies}
                      className="mb-3"
                    >
                      ← Voltar para empresas
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {selectedCompany.products.map(
                      (product: any, prodIdx: number) => (
                        <div
                          key={prodIdx}
                          className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded"
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.category} • {product.stockQuantity} em
                              estoque
                            </p>
                          </div>
                          <span
                            className={`text-xs ${
                              product.stockQuantity === 0
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                            } rounded-full px-2 py-0.5 ml-2 font-semibold`}
                          >
                            {product.stockQuantity === 0
                              ? "Sem estoque"
                              : "Estoque baixo"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {lowStockCompanies.map((company, idx) => (
                    <div
                      key={idx}
                      className="mb-4 border-b last:border-0 pb-4 cursor-pointer hover:bg-muted/50 p-2 rounded"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{company.name}</h3>
                        <span className="text-xs bg-yellow-500 text-white rounded-full px-2 py-0.5 ml-2">
                          {company.count} produtos
                        </span>
                      </div>
                    </div>
                  ))}
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
