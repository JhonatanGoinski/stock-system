import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Package,
  TrendingUp,
  Building2,
  Factory,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface TopProductionProduct {
  id: number;
  name: string;
  category: string;
  size: string | null;
  stockQuantity: number;
  totalProduced: number;
  company?: {
    id: number;
    name: string;
  } | null;
}

interface CompanyRanking {
  companyId: number | null;
  companyName: string;
  products: TopProductionProduct[];
  totalProduced: number;
}

export function TopProductionRanking() {
  const [topProducts, setTopProducts] = useState<TopProductionProduct[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchTopProduction();
  }, []);

  const fetchTopProduction = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products/top-production");

      if (response.ok) {
        const data = await response.json();
        setTopProducts(data);
      } else {
        setError("Erro ao carregar ranking de produção");
      }
    } catch (error) {
      console.error("Erro ao buscar ranking de produção:", error);
      setError("Erro ao carregar ranking de produção");
    } finally {
      setIsLoading(false);
    }
  };

  const getStockBadgeVariant = (quantity: number) => {
    if (quantity === 0) return "destructive";
    if (quantity < 5) return "secondary";
    return "default";
  };

  const toggleCompany = (companyId: number | null) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId || 0)) {
      newExpanded.delete(companyId || 0);
    } else {
      newExpanded.add(companyId || 0);
    }
    setExpandedCompanies(newExpanded);
  };

  // Agrupar produtos por empresa
  const groupByCompany = (
    products: TopProductionProduct[]
  ): CompanyRanking[] => {
    const grouped: Record<string, CompanyRanking> = {};

    products.forEach((product) => {
      const companyId = product.company?.id || null;
      const companyName = product.company?.name || "Produção Interna";
      const key = companyId?.toString() || "internal";

      if (!grouped[key]) {
        grouped[key] = {
          companyId,
          companyName,
          products: [],
          totalProduced: 0,
        };
      }

      grouped[key].products.push(product);
      grouped[key].totalProduced += product.totalProduced;
    });

    // Ordenar por total produzido e limitar a 5 produtos por empresa
    return Object.values(grouped)
      .map((company) => ({
        ...company,
        products: company.products
          .sort((a, b) => b.totalProduced - a.totalProduced)
          .slice(0, 5),
      }))
      .sort((a, b) => b.totalProduced - a.totalProduced);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4" />
            Produtos Mais Produzidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">
            Carregando ranking...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4" />
            Produtos Mais Produzidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive text-sm">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const companyRankings = groupByCompany(topProducts);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="w-4 h-4" />
          Produtos Mais Produzidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companyRankings.length > 0 ? (
            companyRankings.map((companyRanking) => (
              <div
                key={companyRanking.companyId || "internal"}
                className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
              >
                {/* Cabeçalho da empresa - clicável */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleCompany(companyRanking.companyId)}
                >
                  <div className="flex items-center gap-2">
                    {companyRanking.companyId ? (
                      <Building2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Factory className="w-4 h-4 text-blue-600" />
                    )}
                    <h3 className="font-semibold text-sm">
                      {companyRanking.companyName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {companyRanking.totalProduced.toLocaleString("pt-BR")}{" "}
                      unid. total
                    </Badge>
                    {expandedCompanies.has(companyRanking.companyId || 0) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Produtos da empresa - expansível */}
                {expandedCompanies.has(companyRanking.companyId || 0) && (
                  <div className="space-y-2 mt-3 pt-3 border-t">
                    {companyRanking.products.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-medium truncate text-sm">
                                {product.name}
                              </p>
                              {index < 3 && (
                                <TrendingUp className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                              )}
                            </div>
                            {!isMobile && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {product.category}
                                </span>
                                {product.size && (
                                  <>
                                    <span className="text-muted-foreground text-xs">
                                      •
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {product.size}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <div className="text-right">
                            <p className="font-semibold text-xs">
                              {product.totalProduced.toLocaleString("pt-BR")}{" "}
                              unid.
                            </p>
                            {!isMobile && (
                              <p className="text-xs text-muted-foreground">
                                total produzido
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={getStockBadgeVariant(
                              product.stockQuantity
                            )}
                            className="text-xs"
                          >
                            <Package className="w-2.5 h-2.5 mr-1" />
                            {product.stockQuantity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum registro de produção encontrado</p>
              <p className="text-xs">
                Os produtos aparecerão aqui conforme forem produzidos
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
