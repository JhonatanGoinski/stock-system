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
import { DashboardStats } from "@/components/dashboard-stats";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

export default function Home() {
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

  // Se estiver logado, mostrar o dashboard
  return <DashboardContent />;
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
  const isMobile = useIsMobile();

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
                      <Button onClick={() => setShowProductForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Produto
                      </Button>
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
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
                                  {formatCurrency(Number(product.salePrice))}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={getStockBadgeVariant(
                                      product.stockQuantity
                                    )}
                                  >
                                    {getStockBadgeText(product.stockQuantity)}
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
                  </TabsContent>

                  <TabsContent value="customers" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold">Clientes</h2>
                      <Button onClick={() => setShowCustomerForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Cliente
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
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sales.map((sale) => (
                              <TableRow key={sale.id}>
                                <TableCell className="font-medium">
                                  {sale.product?.name ||
                                    "Produto não encontrado"}
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
                                  {new Date(sale.saleDate).toLocaleDateString(
                                    "pt-BR"
                                  )}
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
                      <Button
                        onClick={() => setShowProductForm(true)}
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar
                      </Button>
                    </div>
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
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
                                  {formatCurrency(Number(product.salePrice))}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={getStockBadgeVariant(
                                      product.stockQuantity
                                    )}
                                  >
                                    {getStockBadgeText(product.stockQuantity)}
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
                  </>
                )}
                {activeTab === "customers" && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">Clientes</h2>
                      <Button
                        onClick={() => setShowCustomerForm(true)}
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar
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
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sales.map((sale) => (
                              <TableRow key={sale.id}>
                                <TableCell className="font-medium">
                                  {sale.product?.name ||
                                    "Produto não encontrado"}
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
                                  {new Date(sale.saleDate).toLocaleDateString(
                                    "pt-BR"
                                  )}
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
        {isMobile ? (
          <Drawer
            open={showProductForm}
            onOpenChange={(open) => {
              if (!open) {
                setShowProductForm(false);
                setEditingProduct(null);
              }
            }}
          >
            <DrawerContent>
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
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog
            open={showProductForm}
            onOpenChange={(open) => {
              if (!open) {
                setShowProductForm(false);
                setEditingProduct(null);
              }
            }}
          >
            <DialogContent>
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
        )}

        {isMobile ? (
          <Drawer
            open={showCustomerForm}
            onOpenChange={(open) => {
              if (!open) {
                setShowCustomerForm(false);
                setEditingCustomer(null);
              }
            }}
          >
            <DrawerContent>
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
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog
            open={showCustomerForm}
            onOpenChange={(open) => {
              if (!open) {
                setShowCustomerForm(false);
                setEditingCustomer(null);
              }
            }}
          >
            <DialogContent>
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
        )}

        {isMobile ? (
          <Drawer
            open={showSaleForm}
            onOpenChange={(open) => {
              if (!open) setShowSaleForm(false);
            }}
          >
            <DrawerContent>
              {showSaleForm && (
                <SaleForm
                  onSuccess={handleSaleFormSuccess}
                  onCancel={() => setShowSaleForm(false)}
                />
              )}
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog
            open={showSaleForm}
            onOpenChange={(open) => {
              if (!open) setShowSaleForm(false);
            }}
          >
            <DialogContent>
              {showSaleForm && (
                <SaleForm
                  onSuccess={handleSaleFormSuccess}
                  onCancel={() => setShowSaleForm(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AuthGuard>
  );
}
