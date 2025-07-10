"use client";

import {
  Package,
  AlertCircle,
  Building2,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/shared/mobile-nav";
import { Dialog, DialogContent } from "@/components/shared/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu";
import { ProfileEditModal } from "@/components/shared/modals/profile-edit-modal";
import { SettingsModal } from "@/components/shared/modals/settings-modal";
import { ConfirmDialog } from "@/components/shared/ui/confirm-dialog";

interface MobileHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileHeader({ activeTab, onTabChange }: MobileHeaderProps) {
  const { data: session } = useSession();
  const [showLowStockDialog, setShowLowStockDialog] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [lowStockCompanies, setLowStockCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Função para forçar atualização do header quando o perfil for modificado
  const handleProfileUpdated = () => {
    // Forçar re-render do componente para mostrar as mudanças
    window.location.reload();
  };

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

  const handleSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = () => {
    signOut({ callbackUrl: "/" });
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

          {/* Ícone da empresa - agora dois à esquerda do ThemeToggle, com borda igual */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden h-9 w-9"
              >
                <Building2 className="h-6 w-6" />
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
              <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
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

          <ThemeToggle />
        </div>
      </div>

      {/* Modal de Edição de Perfil */}
      <ProfileEditModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Modal de Configurações */}
      <SettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Dialog de estoque baixo */}
      <Dialog open={showLowStockDialog} onOpenChange={setShowLowStockDialog}>
        <DialogContent className="w-[95vw] max-w-md max-h-[80vh] overflow-y-auto">
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
                      <Badge variant="destructive" className="text-xs">
                        {product.stockQuantity === 0
                          ? "Sem estoque"
                          : "Estoque baixo"}
                      </Badge>
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
                    <Badge variant="destructive" className="text-xs">
                      {company.count} produtos
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmação de Logout */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Confirmar Saída"
        description="Tem certeza que deseja sair do sistema? Você será desconectado e redirecionado para a página de login."
        confirmText="Sair"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmSignOut}
      />
    </header>
  );
}
