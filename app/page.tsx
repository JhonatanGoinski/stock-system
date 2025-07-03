"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { LandingPage } from "@/components/landing-page";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductForm } from "@/components/product-form";
import { CustomerForm } from "@/components/customer-form";
import { SaleForm } from "@/components/sale-form";
import { CompanyForm } from "@/components/company-form";
import { ReportsPage } from "@/components/reports-page";
import { MobileHeader } from "@/components/mobile-header";
import { MobileTabs } from "@/components/mobile-tabs";
import { MobileDashboardStats } from "@/components/mobile-dashboard-stats";
import { formatCurrency, getCurrentDateString } from "@/lib/utils";
import type { Product, Customer, SaleWithDetails } from "@/lib/prisma";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  ChevronUp,
  ChevronDown,
  Factory,
  Calendar,
  Building2,
  PowerOff,
} from "lucide-react";
import { DashboardStats } from "@/components/dashboard-stats";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { SalesFilter } from "@/components/sales-filter";
import { CustomersFilter } from "@/components/customers-filter";
import { Input } from "@/components/ui/input";
import { ProductionHistory } from "@/components/production-history";
import { TopProductionRanking } from "@/components/top-production-ranking";
import { CompaniesProductsList } from "@/components/companies-products-list";
import { useToast } from "@/hooks/use-toast";
import { CompaniesInactiveList } from "@/components/companies-list";

export default function Home() {
  const { data: session, status } = useSession();
  const [showInactiveCompanies, setShowInactiveCompanies] = useState(false);
  const [inactiveCompanies, setInactiveCompanies] = useState<any[]>([]);
  const [inactiveCompaniesFilter, setInactiveCompaniesFilter] = useState("");
  const [inactiveCompaniesPage, setInactiveCompaniesPage] = useState(1);
  const [inactiveCompaniesLoading, setInactiveCompaniesLoading] =
    useState(false);
  const INACTIVE_COMPANIES_PAGE_SIZE = 5;

  // Se não estiver logado, mostrar a landing page
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LandingPage />;
  }

  // Se estiver logado, mostrar o dashboard protegido
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function ProductsHeaderActions({
  productionMode,
  setProductionMode,
  setShowProductForm,
}: {
  productionMode: boolean;
  setProductionMode: React.Dispatch<React.SetStateAction<boolean>>;
  setShowProductForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:w-auto sm:gap-2">
      <Button
        variant={productionMode ? "default" : "outline"}
        onClick={() => setProductionMode(!productionMode)}
        size="sm"
        className="sm:w-auto"
      >
        {productionMode ? (
          <>
            <Package className="w-4 h-4 mr-2" />
            Modo Normal
          </>
        ) : (
          <>
            <Factory className="w-4 h-4 mr-2" />
            Modo Produção
          </>
        )}
      </Button>
      {productionMode && (
        <Button
          onClick={() => setShowProductForm(true)}
          size="sm"
          className="sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      )}
    </div>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMoreProducts, setShowMoreProducts] = useState(false);
  const [productsLimit] = useState(10); // Limite inicial de produtos
  const [productionMode, setProductionMode] = useState(false);
  const [productionQuantities, setProductionQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [productionDates, setProductionDates] = useState<{
    [key: number]: string;
  }>({});
  const [productionNotes, setProductionNotes] = useState<{
    [key: number]: string;
  }>({});
  const [showProductionHistory, setShowProductionHistory] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const isMobile = useIsMobile();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<
    "product" | "customer" | "sale" | null
  >(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [showInactiveCompanies, setShowInactiveCompanies] = useState(false);
  const [inactiveCompanies, setInactiveCompanies] = useState<any[]>([]);
  const [inactiveCompaniesFilter, setInactiveCompaniesFilter] = useState("");
  const [inactiveCompaniesPage, setInactiveCompaniesPage] = useState(1);
  const [inactiveCompaniesLoading, setInactiveCompaniesLoading] =
    useState(false);
  const INACTIVE_COMPANIES_PAGE_SIZE = 5;

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchSales();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsProductsLoading(true);
      console.log("📡 Buscando produtos atualizados...");

      // Forçar atualização sem cache
      const response = await fetch("/api/products", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      console.log(
        "📡 Resposta da API produtos:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Produtos recebidos:", data.length, "produtos");
        setProducts(data);
        setShowMoreProducts(false);
      } else {
        console.error("❌ Erro na resposta da API produtos:", response.status);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error);
    } finally {
      setIsLoading(false);
      setIsProductsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales");
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      } else {
        console.error("Erro na resposta da API de vendas:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Produto deletado!",
          description: "O produto foi removido com sucesso.",
          variant: "success",
        });
        setTimeout(() => {
          fetchProducts();
          setRefreshTrigger((prev) => prev + 1);
          setIsActionLoading(true);
          setTimeout(() => setIsActionLoading(false), 1000);
        }, 100);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao deletar produto",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar produto",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Cliente deletado!",
          description: "O cliente foi removido com sucesso.",
          variant: "success",
        });
        fetchCustomers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao deletar cliente",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar cliente",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setShowMoreProducts(false);
    setIsActionLoading(true);
    // Forçar recarregamento dos dados
    fetchProducts();
    setRefreshTrigger((prev) => prev + 1);
    // Desativar loading após um tempo
    setTimeout(() => setIsActionLoading(false), 1000);
  };

  const handleCustomerFormSuccess = () => {
    setShowCustomerForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleCompanyFormSuccess = () => {
    setShowCompanyForm(false);
    setIsActionLoading(true);
    // Recarregar produtos para atualizar a lista de empresas
    fetchProducts();
    setRefreshTrigger((prev) => prev + 1);
    // Desativar loading após um tempo
    setTimeout(() => setIsActionLoading(false), 1000);
  };

  const handleToggleCompanyStatus = async (
    companyId: number,
    isActive: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/companies/${companyId}/toggle-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }
      );

      if (response.ok) {
        toast({
          title: isActive ? "Empresa ativada!" : "Empresa desativada!",
          description: isActive
            ? "A empresa foi ativada e seus produtos estão disponíveis para venda."
            : "A empresa foi desativada e seus produtos não estão mais disponíveis para venda.",
          variant: "success",
        });
        // Recarregar dados
        fetchProducts();
        setRefreshTrigger((prev) => prev + 1);
        setIsActionLoading(true);
        setTimeout(() => setIsActionLoading(false), 1000);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao alterar status da empresa",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao alterar status da empresa",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Empresa deletada!",
          description: `A empresa "${result.deletedCompany}" foi removida com sucesso.`,
          variant: "success",
        });
        // Recarregar dados
        fetchProducts();
        setRefreshTrigger((prev) => prev + 1);
        setIsActionLoading(true);
        setTimeout(() => setIsActionLoading(false), 1000);
      } else {
        const errorData = await response.json();
        toast({
          title: errorData.error || "Erro ao deletar empresa",
          description: errorData.message || "Erro desconhecido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar empresa",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSaleFormSuccess = () => {
    setShowSaleForm(false);
    fetchProducts();
    fetchSales();
    setRefreshTrigger((prev) => prev + 1);
    setIsActionLoading(true);
    setTimeout(() => setIsActionLoading(false), 1000);
  };

  const handleProductionQuantityChange = (
    productId: number,
    quantity: number
  ) => {
    setProductionQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, quantity), // Não permite valores negativos
    }));
  };

  const handleProductionDateChange = (productId: number, date: string) => {
    // Usar exatamente a data selecionada, sem conversões de timezone
    setProductionDates((prev) => ({
      ...prev,
      [productId]: date,
    }));
  };

  const handleProductionNotesChange = (productId: number, notes: string) => {
    setProductionNotes((prev) => ({
      ...prev,
      [productId]: notes,
    }));
  };

  const handleAddProduction = async (productId: number) => {
    const quantity = productionQuantities[productId] || 0;
    // Usar a data selecionada ou a data atual no formato YYYY-MM-DD
    const productionDate = productionDates[productId] || getCurrentDateString();
    const notes = productionNotes[productId] || "";

    if (quantity <= 0) {
      toast({
        title: "Quantidade inválida",
        description:
          "Por favor, insira uma quantidade válida para adicionar ao estoque.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(
        "📡 Adicionando produção:",
        productId,
        quantity,
        productionDate,
        notes
      );

      const response = await fetch(`/api/products/${productId}/production`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity, productionDate, notes }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Produção registrada!",
          description: "A quantidade foi adicionada ao estoque com sucesso.",
          variant: "success",
        });

        // Limpar os campos
        setProductionQuantities((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
        setProductionDates((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
        setProductionNotes((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });

        // Atualizar a lista de produtos
        fetchProducts();
        setRefreshTrigger((prev) => prev + 1);
        setIsActionLoading(true);
        setTimeout(() => setIsActionLoading(false), 1000);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao adicionar produção",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar produção",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStockBadgeVariant = (quantity: number) => {
    if (quantity === 0) return "destructive";
    if (quantity < 5) return "secondary";
    return "default";
  };

  const getStockBadgeText = (quantity: number) => {
    if (quantity === 0) return "Sem estoque";
    if (quantity < 5) return "Estoque baixo";
    return "Em estoque";
  };

  // Funções para filtros
  const fetchSalesWithFilter = async (filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append("date", filters.date);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/sales?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      } else {
        console.error("Erro na resposta da API de vendas:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  };

  const fetchCustomersWithFilter = async (filters: { name?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append("name", filters.name);

      const response = await fetch(`/api/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const handleSalesFilterChange = (filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    fetchSalesWithFilter(filters);
  };

  const handleSalesFilterClear = () => {
    fetchSales();
  };

  const handleCustomersFilterChange = (filters: { name?: string }) => {
    fetchCustomersWithFilter(filters);
  };

  const handleCustomersFilterClear = () => {
    fetchCustomers();
  };

  const handleDeleteSale = async (id: number) => {
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Venda deletada!",
          description: "A venda foi removida e o estoque restaurado.",
          variant: "success",
        });
        fetchSales();
        fetchProducts();
        setRefreshTrigger((prev) => prev + 1);
        setIsActionLoading(true);
        setTimeout(() => setIsActionLoading(false), 1000);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao deletar venda",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar venda",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Buscar empresas inativas com filtro e paginação
  const fetchInactiveCompanies = async (filter = "", page = 1) => {
    setInactiveCompaniesLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("isActive", "false");
      if (filter) params.append("name", filter);
      params.append("page", String(page));
      params.append("pageSize", String(INACTIVE_COMPANIES_PAGE_SIZE));
      const response = await fetch(`/api/companies?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setInactiveCompanies(data);
      } else {
        setInactiveCompanies([]);
      }
    } catch (e) {
      setInactiveCompanies([]);
    } finally {
      setInactiveCompaniesLoading(false);
    }
  };

  // Função para reativar empresa
  const handleReactivateCompany = async (companyId: number) => {
    try {
      const response = await fetch(
        `/api/companies/${companyId}/toggle-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        }
      );
      if (response.ok) {
        toast({
          title: "Empresa reativada!",
          description: "A empresa foi reativada com sucesso.",
          variant: "success",
        });
        fetchProducts();
        setRefreshTrigger((prev) => prev + 1);
        // Atualizar lista de inativas
        fetchInactiveCompanies(inactiveCompaniesFilter, inactiveCompaniesPage);
      } else {
        toast({
          title: "Erro ao reativar empresa",
          description: "Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Erro ao reativar empresa",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Ao trocar de aba, se for para produtos, mostrar loading
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "products") {
      setProducts([]);
      setIsProductsLoading(true);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-background md:mt-16">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="px-4 py-4 pb-20 md:pb-4 md:container md:mx-auto md:px-6 md:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Carregando sistema...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Tabs */}
            <div className="hidden md:block">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger
                    value="dashboard"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="products"
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Produtos
                  </TabsTrigger>
                  <TabsTrigger
                    value="customers"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Clientes
                  </TabsTrigger>
                  <TabsTrigger
                    value="sales"
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Vendas
                  </TabsTrigger>
                  <TabsTrigger
                    value="reports"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Relatórios
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                  <DashboardStats />
                </TabsContent>

                <TabsContent value="products" className="space-y-6">
                  {isProductsLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">
                          Carregando produtos...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold">
                          {productionMode ? "Produção" : "Produtos"}
                        </h2>
                        <ProductsHeaderActions
                          productionMode={productionMode}
                          setProductionMode={setProductionMode}
                          setShowProductForm={setShowProductForm}
                        />
                      </div>

                      {/* Ranking de produtos mais produzidos - apenas no modo normal */}
                      {!productionMode && (
                        <div className="mb-6">
                          <TopProductionRanking />
                        </div>
                      )}

                      {/* Lista de produtos organizada por empresa - SEMPRE renderizada */}
                      <CompaniesProductsList
                        onAddProduct={() => setShowProductForm(true)}
                        onAddCompany={() => setShowCompanyForm(true)}
                        onShowInactiveCompanies={() =>
                          setShowInactiveCompanies(true)
                        }
                        onEditProduct={(product) => {
                          const fullProduct = products.find(
                            (p) => p.id === product.id
                          );
                          if (fullProduct) {
                            setEditingProduct(fullProduct);
                            setShowProductForm(true);
                          }
                        }}
                        onDeleteProduct={(productId) => {
                          setItemToDelete({ id: productId });
                          setDeleteType("product");
                          setShowDeleteModal(true);
                        }}
                        onAddProduction={handleAddProduction}
                        onShowProductionHistory={(productId, productName) => {
                          setSelectedProductForHistory({
                            id: productId,
                            name: productName,
                          });
                          setShowProductionHistory(true);
                        }}
                        onToggleCompanyStatus={handleToggleCompanyStatus}
                        onDeleteCompany={handleDeleteCompany}
                        productionQuantities={productionQuantities}
                        productionDates={productionDates}
                        productionNotes={productionNotes}
                        onProductionQuantityChange={
                          handleProductionQuantityChange
                        }
                        onProductionDateChange={handleProductionDateChange}
                        onProductionNotesChange={handleProductionNotesChange}
                        isProductionMode={productionMode}
                        refreshTrigger={refreshTrigger}
                        isActionLoading={isActionLoading}
                      />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="customers" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">Clientes</h2>
                    <Button onClick={() => setShowCustomerForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Cliente
                    </Button>
                  </div>

                  <CustomersFilter
                    onFilterChange={handleCustomersFilterChange}
                    onClearFilters={handleCustomersFilterClear}
                  />

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium">
                                {customer.name}
                              </TableCell>
                              <TableCell>{customer.email}</TableCell>
                              <TableCell>{customer.phone}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    customer.isActive ? "default" : "secondary"
                                  }
                                >
                                  {customer.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCustomer(customer);
                                      setShowCustomerForm(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setItemToDelete(customer);
                                      setDeleteType("customer");
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sales" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">Vendas</h2>
                    <Button onClick={() => setShowSaleForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Venda
                    </Button>
                  </div>

                  <SalesFilter
                    onFilterChange={handleSalesFilterChange}
                    onClearFilters={handleSalesFilterClear}
                  />

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Valor Total</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sales.map((sale) => (
                            <TableRow key={sale.id}>
                              <TableCell className="font-medium">
                                {sale.product?.name || "Produto não encontrado"}
                              </TableCell>
                              <TableCell>
                                {sale.customer?.name ||
                                  "Cliente não encontrado"}
                              </TableCell>
                              <TableCell>{sale.quantity}</TableCell>
                              <TableCell>
                                {formatCurrency(Number(sale.totalAmount))}
                              </TableCell>
                              <TableCell>
                                {typeof sale.saleDate === "string" &&
                                sale.saleDate
                                  ? String(sale.saleDate)
                                      .split("T")[0]
                                      .split("-")
                                      .reverse()
                                      .join("/")
                                  : ""}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setItemToDelete(sale);
                                      setDeleteType("sale");
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reports">
                  <ReportsPage />
                </TabsContent>
              </Tabs>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden pb-20">
              {activeTab === "dashboard" && <DashboardStats />}
              {activeTab === "products" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                      {productionMode ? "Produção" : "Produtos"}
                    </h2>
                    <ProductsHeaderActions
                      productionMode={productionMode}
                      setProductionMode={setProductionMode}
                      setShowProductForm={setShowProductForm}
                    />
                  </div>

                  {/* Ranking de produtos mais produzidos - apenas no modo normal */}
                  {!productionMode && (
                    <div className="mb-4">
                      <TopProductionRanking />
                    </div>
                  )}

                  {/* Lista de produtos organizada por empresa - UNIFICADA com desktop */}
                  <CompaniesProductsList
                    onAddProduct={() => setShowProductForm(true)}
                    onAddCompany={() => setShowCompanyForm(true)}
                    onShowInactiveCompanies={() =>
                      setShowInactiveCompanies(true)
                    }
                    onEditProduct={(product) => {
                      const fullProduct = products.find(
                        (p) => p.id === product.id
                      );
                      if (fullProduct) {
                        setEditingProduct(fullProduct);
                        setShowProductForm(true);
                      }
                    }}
                    onDeleteProduct={(productId) => {
                      setItemToDelete({ id: productId });
                      setDeleteType("product");
                      setShowDeleteModal(true);
                    }}
                    onAddProduction={handleAddProduction}
                    onShowProductionHistory={(productId, productName) => {
                      setSelectedProductForHistory({
                        id: productId,
                        name: productName,
                      });
                      setShowProductionHistory(true);
                    }}
                    onToggleCompanyStatus={handleToggleCompanyStatus}
                    onDeleteCompany={handleDeleteCompany}
                    productionQuantities={productionQuantities}
                    productionDates={productionDates}
                    productionNotes={productionNotes}
                    onProductionQuantityChange={handleProductionQuantityChange}
                    onProductionDateChange={handleProductionDateChange}
                    onProductionNotesChange={handleProductionNotesChange}
                    isProductionMode={productionMode}
                    refreshTrigger={refreshTrigger}
                    isActionLoading={isActionLoading}
                  />
                </>
              )}
              {activeTab === "customers" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Clientes</h2>
                    <Button onClick={() => setShowCustomerForm(true)} size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Adicionar
                    </Button>
                  </div>

                  <CustomersFilter
                    onFilterChange={handleCustomersFilterChange}
                    onClearFilters={handleCustomersFilterClear}
                  />

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium">
                                {customer.name}
                              </TableCell>
                              <TableCell>{customer.email}</TableCell>
                              <TableCell>{customer.phone}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    customer.isActive ? "default" : "secondary"
                                  }
                                >
                                  {customer.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCustomer(customer);
                                      setShowCustomerForm(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setItemToDelete(customer);
                                      setDeleteType("customer");
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
              {activeTab === "sales" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Vendas</h2>
                    <Button onClick={() => setShowSaleForm(true)} size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Nova Venda
                    </Button>
                  </div>

                  <SalesFilter
                    onFilterChange={handleSalesFilterChange}
                    onClearFilters={handleSalesFilterClear}
                  />

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Valor Total</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sales.map((sale) => (
                            <TableRow key={sale.id}>
                              <TableCell className="font-medium">
                                {sale.product?.name || "Produto não encontrado"}
                              </TableCell>
                              <TableCell>
                                {sale.customer?.name ||
                                  "Cliente não encontrado"}
                              </TableCell>
                              <TableCell>{sale.quantity}</TableCell>
                              <TableCell>
                                {formatCurrency(Number(sale.totalAmount))}
                              </TableCell>
                              <TableCell>
                                {typeof sale.saleDate === "string" &&
                                sale.saleDate
                                  ? String(sale.saleDate)
                                      .split("T")[0]
                                      .split("-")
                                      .reverse()
                                      .join("/")
                                  : ""}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setItemToDelete(sale);
                                      setDeleteType("sale");
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
              {activeTab === "reports" && <ReportsPage />}
              <MobileTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </>
        )}
      </div>

      {/* Forms */}
      <Dialog
        open={showProductForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowProductForm(false);
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {showProductForm && (
            <ProductForm
              product={editingProduct || undefined}
              onSuccess={handleProductFormSuccess}
              onCancel={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCustomerForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowCustomerForm(false);
            setEditingCustomer(null);
          }
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {showCustomerForm && (
            <CustomerForm
              customer={editingCustomer || undefined}
              onSuccess={handleCustomerFormSuccess}
              onCancel={() => {
                setShowCustomerForm(false);
                setEditingCustomer(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSaleForm}
        onOpenChange={(open) => {
          if (!open) setShowSaleForm(false);
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {showSaleForm && (
            <SaleForm
              onSuccess={handleSaleFormSuccess}
              onCancel={() => setShowSaleForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCompanyForm}
        onOpenChange={(open) => {
          if (!open) setShowCompanyForm(false);
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {showCompanyForm && (
            <CompanyForm
              onSuccess={handleCompanyFormSuccess}
              onCancel={() => setShowCompanyForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico de Produção */}
      {showProductionHistory && selectedProductForHistory && (
        <ProductionHistory
          productId={selectedProductForHistory.id}
          productName={selectedProductForHistory.name}
          onClose={() => {
            setShowProductionHistory(false);
            setSelectedProductForHistory(null);
          }}
        />
      )}

      {/* Modal de confirmação */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <h2 className="text-lg font-bold mb-2">Confirmar exclusão</h2>
          {deleteType === "product" && (
            <p>
              Tem certeza que deseja deletar o produto{" "}
              <b>{itemToDelete?.name}</b>? Esta ação não pode ser desfeita.
            </p>
          )}
          {deleteType === "customer" && (
            <p>
              Tem certeza que deseja deletar o cliente{" "}
              <b>{itemToDelete?.name}</b>? Esta ação não pode ser desfeita.
            </p>
          )}
          {deleteType === "sale" && (
            <p>
              Tem certeza que deseja deletar esta venda? O estoque do produto
              será restaurado.
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setShowDeleteModal(false);
                if (deleteType === "product" && itemToDelete) {
                  await handleDeleteProduct(itemToDelete.id);
                }
                if (deleteType === "customer" && itemToDelete) {
                  await handleDeleteCustomer(itemToDelete.id);
                }
                if (deleteType === "sale" && itemToDelete) {
                  await handleDeleteSale(itemToDelete.id);
                }
                setItemToDelete(null);
                setDeleteType(null);
              }}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de empresas inativas */}
      <CompaniesInactiveList
        open={showInactiveCompanies}
        onClose={() => setShowInactiveCompanies(false)}
        companies={inactiveCompanies}
        loading={inactiveCompaniesLoading}
        filter={inactiveCompaniesFilter}
        onFilterChange={setInactiveCompaniesFilter}
        onReactivate={handleReactivateCompany}
        onFetch={fetchInactiveCompanies}
        page={inactiveCompaniesPage}
        setPage={setInactiveCompaniesPage}
        pageSize={INACTIVE_COMPANIES_PAGE_SIZE}
      />
    </div>
  );
}
