"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
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
import { formatCurrency } from "@/lib/utils";
import type { Product, Customer, SaleWithDetails } from "@/lib/prisma";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
} from "lucide-react";

export default function Home() {
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

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchSales();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
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
        console.log("Vendas recebidas:", data.length, data);
        setSales(data);
      } else {
        console.error("Erro na resposta da API de vendas:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert("Erro ao deletar produto");
      }
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      alert("Erro ao deletar produto");
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar/desativar este cliente?"))
      return;

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCustomers();
      } else {
        alert("Erro ao deletar cliente");
      }
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      alert("Erro ao deletar cliente");
    }
  };

  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
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

                  <TabsContent value="dashboard">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-bold text-foreground">
                          Dashboard
                        </h2>
                        <p className="text-muted-foreground">
                          Visão geral do seu negócio
                        </p>
                      </div>
                      <MobileDashboardStats />
                    </div>
                  </TabsContent>

                  <TabsContent value="products">
                    {showProductForm ? (
                      <ProductForm
                        product={editingProduct || undefined}
                        onSuccess={handleProductFormSuccess}
                        onCancel={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                        }}
                      />
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-3xl font-bold text-foreground">
                              Produtos
                            </h2>
                            <p className="text-muted-foreground">
                              Gerencie seu catálogo de produtos
                            </p>
                          </div>
                          <Button
                            onClick={() => setShowProductForm(true)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Novo Produto
                          </Button>
                        </div>

                        <Card>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Produto</TableHead>
                                  <TableHead>Categoria</TableHead>
                                  <TableHead>Preço</TableHead>
                                  <TableHead>Estoque</TableHead>
                                  <TableHead>Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {products.map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                      {product.name}
                                    </TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>
                                      {formatCurrency(
                                        Number(product.salePrice)
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={getStockBadgeVariant(
                                          product.stockQuantity
                                        )}
                                      >
                                        {product.stockQuantity} -{" "}
                                        {getStockBadgeText(
                                          product.stockQuantity
                                        )}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setEditingProduct(product);
                                            setShowProductForm(true);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteProduct(product.id)
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
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="customers">
                    {showCustomerForm ? (
                      <CustomerForm
                        customer={editingCustomer || undefined}
                        onSuccess={handleCustomerFormSuccess}
                        onCancel={() => {
                          setShowCustomerForm(false);
                          setEditingCustomer(null);
                        }}
                      />
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-3xl font-bold text-foreground">
                              Clientes
                            </h2>
                            <p className="text-muted-foreground">
                              Gerencie sua base de clientes
                            </p>
                          </div>
                          <Button
                            onClick={() => setShowCustomerForm(true)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Novo Cliente
                          </Button>
                        </div>

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
                                          customer.isActive
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {customer.isActive
                                          ? "Ativo"
                                          : "Inativo"}
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
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sales">
                    {showSaleForm ? (
                      <SaleForm
                        onSuccess={handleSaleFormSuccess}
                        onCancel={() => setShowSaleForm(false)}
                      />
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-3xl font-bold text-foreground">
                              Vendas
                            </h2>
                            <p className="text-muted-foreground">
                              Registre e acompanhe suas vendas
                            </p>
                          </div>
                          <Button
                            onClick={() => setShowSaleForm(true)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Nova Venda
                          </Button>
                        </div>

                        <Card>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Data</TableHead>
                                  <TableHead>Cliente</TableHead>
                                  <TableHead>Produto</TableHead>
                                  <TableHead>Quantidade</TableHead>
                                  <TableHead>Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sales.map((sale) => (
                                  <TableRow key={sale.id}>
                                    <TableCell>
                                      {new Date(
                                        sale.saleDate
                                      ).toLocaleDateString("pt-BR")}
                                    </TableCell>
                                    <TableCell>
                                      {sale.customer?.name ||
                                        "Cliente não cadastrado"}
                                    </TableCell>
                                    <TableCell>
                                      {sale.product?.name ||
                                        "Produto não encontrado"}
                                    </TableCell>
                                    <TableCell>{sale.quantity}</TableCell>
                                    <TableCell>
                                      {formatCurrency(sale.totalAmount || 0)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reports">
                    <ReportsPage />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Mobile Content */}
              <div className="md:hidden pb-20">
                {activeTab === "dashboard" && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Dashboard
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Visão geral do seu negócio
                      </p>
                    </div>
                    <MobileDashboardStats />
                  </div>
                )}

                {activeTab === "products" && (
                  <>
                    {showProductForm ? (
                      <ProductForm
                        product={editingProduct || undefined}
                        onSuccess={handleProductFormSuccess}
                        onCancel={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                        }}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-2xl font-bold text-foreground">
                              Produtos
                            </h2>
                            <p className="text-muted-foreground text-sm">
                              Gerencie seu catálogo
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setShowProductForm(true)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {products.map((product) => (
                            <Card key={product.id} className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {product.category}{" "}
                                    {product.size && `• ${product.size}`}
                                  </p>
                                </div>
                                <Badge
                                  variant={getStockBadgeVariant(
                                    product.stockQuantity
                                  )}
                                  className="text-xs"
                                >
                                  {product.stockQuantity}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="text-xs">
                                  <span className="text-muted-foreground">
                                    Custo:{" "}
                                  </span>
                                  <span>
                                    {formatCurrency(Number(product.costPrice))}
                                  </span>
                                  <span className="text-muted-foreground ml-2">
                                    Venda:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(Number(product.salePrice))}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setShowProductForm(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}

                          {products.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p className="mb-2">Nenhum produto cadastrado</p>
                              <p className="text-sm">
                                Clique em "Adicionar" para começar
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "customers" && (
                  <>
                    {showCustomerForm ? (
                      <CustomerForm
                        customer={editingCustomer || undefined}
                        onSuccess={handleCustomerFormSuccess}
                        onCancel={() => {
                          setShowCustomerForm(false);
                          setEditingCustomer(null);
                        }}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-2xl font-bold text-foreground">
                              Clientes
                            </h2>
                            <p className="text-muted-foreground text-sm">
                              Gerencie seus clientes
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setShowCustomerForm(true)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {customers.map((customer) => (
                            <Card key={customer.id} className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">
                                    {customer.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {customer.email || "Sem email"}
                                    {customer.phone && ` • ${customer.phone}`}
                                  </p>
                                  {customer.city && customer.state && (
                                    <p className="text-xs text-muted-foreground">
                                      {customer.city}, {customer.state}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  variant={
                                    customer.isActive ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {customer.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                              </div>
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setEditingCustomer(customer);
                                    setShowCustomerForm(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() =>
                                    handleDeleteCustomer(customer.id)
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </Card>
                          ))}

                          {customers.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p className="mb-2">Nenhum cliente cadastrado</p>
                              <p className="text-sm">
                                Clique em "Adicionar" para começar
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "sales" && (
                  <>
                    {showSaleForm ? (
                      <SaleForm
                        onSuccess={handleSaleFormSuccess}
                        onCancel={() => setShowSaleForm(false)}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-2xl font-bold text-foreground">
                              Vendas
                            </h2>
                            <p className="text-muted-foreground text-sm">
                              Registre suas vendas
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setShowSaleForm(true)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Registrar
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {sales.map((sale) => (
                            <Card key={sale.id} className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">
                                    {sale.product?.name ||
                                      "Produto não encontrado"}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {sale.product?.category} •{" "}
                                    {new Date(sale.saleDate).toLocaleDateString(
                                      "pt-BR"
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Cliente: {sale.customer?.name || "Balcão"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-sm">
                                    {formatCurrency(sale.totalAmount || 0)}
                                  </p>
                                  {sale.discount && sale.discount > 0 && (
                                    <p className="text-xs text-green-600">
                                      Desc:{" "}
                                      {formatCurrency(Number(sale.discount))}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <span>Qtd: {sale.quantity}</span>
                                <span className="ml-3">
                                  Unit: {formatCurrency(Number(sale.unitPrice))}
                                </span>
                              </div>
                            </Card>
                          ))}

                          {sales.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p className="mb-2">Nenhuma venda registrada</p>
                              <p className="text-sm">
                                Registre sua primeira venda
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "reports" && (
                  <div className="pb-20">
                    <ReportsPage />
                  </div>
                )}
              </div>

              {/* Mobile Tabs */}
              <div className="md:hidden">
                <MobileTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
