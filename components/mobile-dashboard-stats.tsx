"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  todayRevenue: number;
  monthRevenue: number;
  topProducts: Array<{
    name: string;
    category: string;
    total_sold: number;
    revenue: number;
  }>;
  lowStockProducts: Array<{
    name: string;
    category: string;
    stock_quantity: number;
  }>;
  dailySales: Array<{
    date: string;
    revenue: number;
    sales_count: number;
  }>;
}

export function MobileDashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-muted-foreground">Carregando dashboard...</div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="text-destructive font-semibold text-sm">
            Erro ao carregar dashboard
          </h3>
          <p className="text-destructive/80 text-xs mt-1">
            Verifique se o banco de dados está configurado corretamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Cards de métricas - Layout mobile otimizado */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card className="p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-medium md:text-sm">
              Vendas Hoje
            </CardTitle>
            <DollarSign className="h-3 w-3 text-muted-foreground md:h-4 md:w-4" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg font-bold md:text-2xl">
              {formatCurrency(data.todayRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-medium md:text-sm">
              Vendas do Mês
            </CardTitle>
            <TrendingUp className="h-3 w-3 text-muted-foreground md:h-4 md:w-4" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg font-bold md:text-2xl">
              {formatCurrency(data.monthRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-medium md:text-sm">
              Produtos
            </CardTitle>
            <Package className="h-3 w-3 text-muted-foreground md:h-4 md:w-4" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg font-bold md:text-2xl">
              {data.topProducts.length}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-medium md:text-sm">
              Estoque Baixo
            </CardTitle>
            <AlertTriangle className="h-3 w-3 text-muted-foreground md:h-4 md:w-4" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg font-bold text-destructive md:text-2xl">
              {data.lowStockProducts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico - Responsivo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">
            Vendas dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.dailySales}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  if (typeof value === "string" && value.includes("-")) {
                    const [ano, mes, dia] = value.split("-");
                    return `${dia}/${mes}`;
                  }
                  return value;
                }}
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <Tooltip
                labelFormatter={(value) => {
                  if (typeof value === "string" && value.includes("-")) {
                    const [ano, mes, dia] = value.split("-");
                    return `${dia}/${mes}/${ano}`;
                  }
                  return value;
                }}
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Faturamento",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cards de produtos - Layout mobile */}
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topProducts.slice(0, 3).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category} • {product.total_sold} vendidos
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-semibold text-sm">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
              {data.topProducts.length === 0 && (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  Nenhuma venda nos últimos 30 dias
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">
              Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.lowStockProducts.slice(0, 3).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {product.stock_quantity} un.
                  </Badge>
                </div>
              ))}
              {data.lowStockProducts.length === 0 && (
                <p className="text-green-600 dark:text-green-400 text-center py-4 text-sm">
                  ✅ Estoque adequado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
