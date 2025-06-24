"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Search,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import type { Product, Customer } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalItems: number;
    totalDiscount: number;
    profitMargin: string;
  };
  sales: Array<{
    id: number;
    date: string;
    time: string;
    product_name: string;
    product_category: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    customer_city: string | null;
    customer_state: string | null;
    quantity: number;
    unit_price: number;
    discount: number;
    total_amount: number;
    cost_price: number;
    profit: number;
    notes: string | null;
  }>;
  customerStats: Array<{
    name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    totalSpent: number;
    totalItems: number;
    salesCount: number;
  }>;
  productStats: Array<{
    name: string;
    category: string;
    totalSold: number;
    totalRevenue: number;
    salesCount: number;
  }>;
}

export function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    customerId: "all",
    productId: "all",
  });

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    // Carregar relatório dos últimos 30 dias por padrão
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setFilters({
      ...filters,
      startDate: thirtyDaysAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
  }, []);

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      generateReport();
    }
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        customerId: filters.customerId,
        productId: filters.productId,
      });

      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        customerId: filters.customerId,
        productId: filters.productId,
        format: "csv",
      });

      const response = await fetch(`/api/reports?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-vendas-${filters.startDate}-${filters.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      alert("Erro ao exportar relatório");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises detalhadas de vendas e clientes
          </p>
        </div>
        <Button onClick={exportToExcel} disabled={!reportData || isLoading}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId">Cliente</Label>
              <Select
                value={filters.customerId}
                onValueChange={(value) =>
                  setFilters({ ...filters, customerId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem
                      key={customer.id}
                      value={customer.id.toString()}
                    >
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productId">Produto</Label>
              <Select
                value={filters.productId}
                onValueChange={(value) =>
                  setFilters({ ...filters, productId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os produtos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Gerando relatório...</p>
          </div>
        </div>
      )}

      {reportData && (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Vendas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.summary.totalSales}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Faturamento
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.summary.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.summary.totalProfit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margem: {reportData.summary.profitMargin}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Itens Vendidos
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.summary.totalItems}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Clientes e Produtos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.customerStats
                    .slice(0, 5)
                    .map((customer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {customer.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.salesCount} vendas • {customer.totalItems}{" "}
                            itens
                          </p>
                          {customer.city && customer.state && (
                            <p className="text-xs text-muted-foreground">
                              {customer.city}, {customer.state}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-semibold">
                            {formatCurrency(customer.totalSpent)}
                          </p>
                        </div>
                      </div>
                    ))}
                  {reportData.customerStats.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum cliente no período
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.productStats.slice(0, 5).map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • {product.totalSold} vendidos
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="font-semibold">
                          {formatCurrency(product.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {reportData.productStats.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum produto no período
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Vendas */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas Detalhadas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Lucro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sale.customer_name}</p>
                            {sale.customer_city && sale.customer_state && (
                              <p className="text-xs text-muted-foreground">
                                {sale.customer_city}, {sale.customer_state}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sale.product_name}</p>
                            <Badge variant="secondary" className="text-xs">
                              {sale.product_category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>{formatCurrency(sale.unit_price)}</TableCell>
                        <TableCell>
                          {sale.discount > 0 ? (
                            <span className="text-green-600">
                              {formatCurrency(sale.discount)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(sale.total_amount)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              sale.profit > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {formatCurrency(sale.profit)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {reportData.sales.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma venda encontrada no período selecionado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
