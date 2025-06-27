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
} from "lucide-react";
import { DashboardStats } from "@/components/dashboard-stats";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { SalesFilter } from "@/components/sales-filter";
import { CustomersFilter } from "@/components/customers-filter";
import { Input } from "@/components/ui/input";
import { ProductionHistory } from "@/components/production-history";

export default function Home() {
  const { data: session, status } = useSession();

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

function DashboardContent() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchSales();
  }, []);

  const fetchProducts = async () => {
    try {
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
    console.log("🔍 Tentando deletar produto:", id);

    if (
      !confirm(
        "Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita."
      )
    ) {
      console.log("❌ Usuário cancelou a exclusão");
      return;
    }

    try {
      console.log("📡 Enviando requisição DELETE para:", `/api/products/${id}`);

      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      console.log(
        "📡 Resposta recebida:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Produto deletado:", result.message);

        // Pequeno delay para garantir que a exclusão seja processada
        setTimeout(() => {
          fetchProducts();
        }, 100);
      } else {
        const errorData = await response.json();
        console.error("❌ Erro ao deletar produto:", errorData);
        alert(
          `Erro ao deletar produto: ${errorData.error || "Erro desconhecido"}`
        );
      }
    } catch (error) {
      console.error("❌ Erro ao deletar produto:", error);
      alert(
        "Erro ao deletar produto. Verifique sua conexão e tente novamente."
      );
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) {
      return;
    }

    try {
      console.log("📡 Deletando cliente:", id);

      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Cliente deletado:", result.message);
        fetchCustomers();
      } else {
        const errorData = await response.json();
        console.error("❌ Erro ao deletar cliente:", errorData);
        alert(
          `Erro ao deletar cliente: ${errorData.error || "Erro desconhecido"}`
        );
      }
    } catch (error) {
      console.error("❌ Erro ao deletar cliente:", error);
      alert(
        "Erro ao deletar cliente. Verifique sua conexão e tente novamente."
      );
    }
  };

  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setShowMoreProducts(false);
    fetchProducts();
  };

  const handleCustomerFormSuccess = () => {
    setShowCustomerForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleSaleFormSuccess = () => {
    setShowSaleForm(false);
    fetchProducts();
    fetchSales();
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
      alert(
        "Por favor, insira uma quantidade válida para adicionar ao estoque."
      );
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
        console.log("✅ Produção adicionada:", result.message);

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
      } else {
        const errorData = await response.json();
        console.error("❌ Erro ao adicionar produção:", errorData);
        alert(
          `Erro ao adicionar produção: ${
            errorData.error || "Erro desconhecido"
          }`
        );
      }
    } catch (error) {
      console.error("❌ Erro ao adicionar produção:", error);
      alert(
        "Erro ao adicionar produção. Verifique sua conexão e tente novamente."
      );
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
    if (
      !confirm(
        "Tem certeza que deseja excluir esta venda? O estoque do produto será restaurado."
      )
    ) {
      return;
    }

    try {
      console.log("📡 Deletando venda:", id);

      const response = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Venda deletada:", result.message);

        // Atualizar vendas e produtos (para refletir o estoque restaurado)
        fetchSales();
        fetchProducts();
      } else {
        const errorData = await response.json();
        console.error("❌ Erro ao deletar venda:", errorData);
        alert(
          `Erro ao deletar venda: ${errorData.error || "Erro desconhecido"}`
        );
      }
    } catch (error) {
      console.error("❌ Erro ao deletar venda:", error);
      alert("Erro ao deletar venda. Verifique sua conexão e tente novamente.");
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
                onValueChange={setActiveTab}
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
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">Produtos</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={() => setShowProductForm(true)}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Produto
                      </Button>
                      <Button
                        variant={productionMode ? "default" : "outline"}
                        onClick={() => setProductionMode(!productionMode)}
                        className="w-full sm:w-auto"
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
                    </div>
                  </div>

                  {/* Filtro select de produtos */}
                  <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <label className="text-sm font-medium">
                      Filtrar produto:
                    </label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={selectedProductId || ""}
                      onChange={(e) => {
                        setSelectedProductId(
                          e.target.value ? Number(e.target.value) : null
                        );
                      }}
                    >
                      <option value="">Todos</option>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} (Categoria: {prod.category}
                          {prod.size ? `, Tam: ${prod.size}` : ""})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <div className="max-h-[600px] overflow-y-auto">
                        {(selectedProductId
                          ? products.filter((p) => p.id === selectedProductId)
                          : products
                        ).map((product) => (
                          <div
                            key={product.id}
                            className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {product.name}
                                </h3>
                                <p className="text-muted-foreground">
                                  R$ {Number(product.salePrice).toFixed(2)}
                                </p>
                              </div>
                              <Badge
                                variant={getStockBadgeVariant(
                                  product.stockQuantity
                                )}
                              >
                                {product.stockQuantity} em estoque
                              </Badge>
                            </div>

                            {productionMode && (
                              <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                                <div className="flex items-center gap-2 mb-3">
                                  <Factory className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    Adicionar Produção
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedProductForHistory({
                                        id: product.id,
                                        name: product.name,
                                      });
                                      setShowProductionHistory(true);
                                    }}
                                    className="text-xs px-2 py-1 h-6 ml-auto"
                                  >
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Histórico
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder="Qtd"
                                      value={
                                        productionQuantities[product.id] || ""
                                      }
                                      onChange={(e) =>
                                        handleProductionQuantityChange(
                                          product.id,
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-16 h-8 text-xs"
                                    />
                                    <Input
                                      type="date"
                                      value={
                                        productionDates[product.id] ||
                                        getCurrentDateString()
                                      }
                                      onChange={(e) =>
                                        handleProductionDateChange(
                                          product.id,
                                          e.target.value
                                        )
                                      }
                                      className="w-32 h-8 text-xs"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="text"
                                      placeholder="Observações (opcional)"
                                      value={productionNotes[product.id] || ""}
                                      onChange={(e) =>
                                        handleProductionNotesChange(
                                          product.id,
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 h-8 text-xs"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleAddProduction(product.id)
                                      }
                                      disabled={
                                        !productionQuantities[product.id] ||
                                        productionQuantities[product.id] <= 0
                                      }
                                      className="text-xs px-2 py-1 h-8"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Adicionar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductForm(true);
                                }}
                                className="flex-1 text-xs px-2 py-1 h-8"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="flex-1 text-xs px-2 py-1 h-8"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {products.length > productsLimit && (
                        <div className="p-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setShowMoreProducts(!showMoreProducts)
                            }
                            className="w-full"
                          >
                            {showMoreProducts ? (
                              <>
                                <ChevronUp className="mr-2 h-4 w-4" />
                                Ver Menos ({productsLimit} produtos)
                              </>
                            ) : (
                              <>
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Ver Mais ({products.length - productsLimit}{" "}
                                produtos restantes)
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                                    onClick={() =>
                                      handleDeleteCustomer(customer.id)
                                    }
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
                                    onClick={() => handleDeleteSale(sale.id)}
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
                    <h2 className="text-2xl font-bold">Produtos</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={() => setShowProductForm(true)}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Produto
                      </Button>
                      <Button
                        variant={productionMode ? "default" : "outline"}
                        onClick={() => setProductionMode(!productionMode)}
                        className="w-full sm:w-auto"
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
                    </div>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div className="max-h-[600px] overflow-y-auto">
                        {(selectedProductId
                          ? products.filter((p) => p.id === selectedProductId)
                          : products
                        ).map((product) => (
                          <div
                            key={product.id}
                            className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {product.name}
                                </h3>
                                <p className="text-muted-foreground">
                                  R$ {Number(product.salePrice).toFixed(2)}
                                </p>
                              </div>
                              <Badge
                                variant={getStockBadgeVariant(
                                  product.stockQuantity
                                )}
                              >
                                {product.stockQuantity} em estoque
                              </Badge>
                            </div>

                            {productionMode && (
                              <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                                <div className="flex items-center gap-2 mb-3">
                                  <Factory className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    Adicionar Produção
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedProductForHistory({
                                        id: product.id,
                                        name: product.name,
                                      });
                                      setShowProductionHistory(true);
                                    }}
                                    className="text-xs px-2 py-1 h-6 ml-auto"
                                  >
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Histórico
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder="Qtd"
                                      value={
                                        productionQuantities[product.id] || ""
                                      }
                                      onChange={(e) =>
                                        handleProductionQuantityChange(
                                          product.id,
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-16 h-8 text-xs"
                                    />
                                    <Input
                                      type="date"
                                      value={
                                        productionDates[product.id] ||
                                        getCurrentDateString()
                                      }
                                      onChange={(e) =>
                                        handleProductionDateChange(
                                          product.id,
                                          e.target.value
                                        )
                                      }
                                      className="w-32 h-8 text-xs"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="text"
                                      placeholder="Observações (opcional)"
                                      value={productionNotes[product.id] || ""}
                                      onChange={(e) =>
                                        handleProductionNotesChange(
                                          product.id,
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 h-8 text-xs"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleAddProduction(product.id)
                                      }
                                      disabled={
                                        !productionQuantities[product.id] ||
                                        productionQuantities[product.id] <= 0
                                      }
                                      className="text-xs px-2 py-1 h-8"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Adicionar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductForm(true);
                                }}
                                className="flex-1 text-xs px-2 py-1 h-8"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="flex-1 text-xs px-2 py-1 h-8"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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
                                    onClick={() =>
                                      handleDeleteCustomer(customer.id)
                                    }
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
                                    onClick={() => handleDeleteSale(sale.id)}
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
    </div>
  );
}
