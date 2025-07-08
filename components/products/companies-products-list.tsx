"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Separator } from "@/components/shared/ui/separator";
import { Input } from "@/components/shared/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Factory,
  Package,
  Plus,
  Calendar,
  Power,
  PowerOff,
  X,
  ChevronDown as ChevronDownIcon,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/shared/use-toast";
import { getCurrentDateString } from "@/lib/utils";

interface Company {
  id: number;
  name: string;
  isActive: boolean;
  _count: {
    products: number;
  };
}

interface Product {
  id: number;
  name: string;
  category: string;
  size: string | null;
  stockQuantity: number;
  costPrice: number | any; // Compatível com Decimal do Prisma
  salePrice: number | any; // Compatível com Decimal do Prisma
  companyId: number | null;
  company?: {
    id: number;
    name: string;
  } | null;
}

interface CompaniesProductsListProps {
  onAddProduct: () => void;
  onAddCompany: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onAddProduction: (productId: number) => void;
  onShowProductionHistory: (productId: number, productName: string) => void;
  onToggleCompanyStatus: (companyId: number, isActive: boolean) => void;
  onDeleteCompany: (companyId: number) => void;
  productionQuantities: { [key: number]: number };
  productionDates: { [key: number]: string };
  productionNotes: { [key: number]: string };
  onProductionQuantityChange: (productId: number, quantity: number) => void;
  onProductionDateChange: (productId: number, date: string) => void;
  onProductionNotesChange: (productId: number, notes: string) => void;
  isProductionMode: boolean;
  deletingProducts?: Set<number>; // Para mostrar loading nos botões de deletar
  isActionLoading?: boolean; // Para mostrar loading nos botões
  processingProducts?: Set<number>; // Para mostrar loading na produção
  onShowInactiveCompanies: () => void;
  products?: Product[]; // Produtos vindos do hook
  companies?: Company[]; // Empresas vindas do hook
}

export function CompaniesProductsList({
  onAddProduct,
  onAddCompany,
  onEditProduct,
  onDeleteProduct,
  onAddProduction,
  onShowProductionHistory,
  onToggleCompanyStatus,
  onDeleteCompany,
  productionQuantities,
  productionDates,
  productionNotes,
  onProductionQuantityChange,
  onProductionDateChange,
  onProductionNotesChange,
  isProductionMode,
  deletingProducts = new Set(),
  isActionLoading = false,
  processingProducts = new Set(),
  onShowInactiveCompanies,
  products: externalProducts,
  companies: externalCompanies,
}: CompaniesProductsListProps) {
  const [localCompanies, setLocalCompanies] = useState<Company[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(
    new Set()
  );
  const [productFilters, setProductFilters] = useState<{
    [key: number]: string;
  }>({});
  const [productsPerPage, setProductsPerPage] = useState<{
    [key: number]: number;
  }>({});
  const [scrollEnabled, setScrollEnabled] = useState<{
    [key: number]: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar dados apenas uma vez
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Buscar empresas apenas se não vierem do hook
      if (!externalCompanies) {
        const companiesResponse = await fetch("/api/companies");
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setLocalCompanies(companiesData);
        }
      }

      // Buscar produtos apenas se não vierem do hook
      if (!externalProducts) {
        const productsResponse = await fetch("/api/products");
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setLocalProducts(productsData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as empresas e produtos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  // Usar produtos externos se disponíveis, senão usar produtos locais
  const products = externalProducts || localProducts;

  // Usar empresas externas se disponíveis, senão usar empresas locais
  const companies = externalCompanies || localCompanies;

  console.log(
    "📦 CompaniesProductsList - Produtos:",
    products.length,
    "Empresas:",
    companies.length
  );

  console.log("📦 Dados no CompaniesProductsList:", {
    externalProducts: externalProducts?.length || 0,
    localProducts: localProducts?.length || 0,
    totalProducts: products.length,
    externalCompanies: externalCompanies?.length || 0,
    localCompanies: localCompanies?.length || 0,
    totalCompanies: companies.length,
  });

  const getProductsByCompany = (companyId: number | null) => {
    return products.filter((product) => product.companyId === companyId);
  };

  const loadMoreProducts = (companyId: number | null) => {
    const currentLimit = productsPerPage[companyId || 0] || 4;
    const newLimit = currentLimit + 4;
    setProductsPerPage((prev) => ({
      ...prev,
      [companyId || 0]: newLimit,
    }));

    // Ativar scroll quando passar de 4 produtos
    if (newLimit > 4) {
      setScrollEnabled((prev) => ({
        ...prev,
        [companyId || 0]: true,
      }));
    }
  };

  const loadLessProducts = (companyId: number | null) => {
    const currentLimit = productsPerPage[companyId || 0] || 4;
    const newLimit = Math.max(4, currentLimit - 4); // Mínimo de 4 produtos
    setProductsPerPage((prev) => ({
      ...prev,
      [companyId || 0]: newLimit,
    }));

    // Desativar scroll quando voltar para 4 produtos
    if (newLimit <= 4) {
      setScrollEnabled((prev) => ({
        ...prev,
        [companyId || 0]: false,
      }));
    }
  };

  const resetPagination = (companyId: number | null) => {
    setProductsPerPage((prev) => ({
      ...prev,
      [companyId || 0]: 4,
    }));
    // Desativar scroll ao resetar
    setScrollEnabled((prev) => ({
      ...prev,
      [companyId || 0]: false,
    }));
  };

  const getVisibleProducts = (companyId: number | null) => {
    const allProducts = getProductsByCompany(companyId);
    const limit = productsPerPage[companyId || 0] || 4;
    return allProducts.slice(0, limit);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading removido pois não fazemos mais refresh automático */}

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produtos por Empresa</h2>
        {isProductionMode && (
          <div className="flex flex-col gap-2 sm:flex-row sm:w-auto sm:gap-2">
            <Button
              onClick={onAddCompany}
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Building2 className="w-4 h-4" />
              )}
              Adicionar Empresa
            </Button>
            <Button
              onClick={onShowInactiveCompanies}
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <PowerOff className="w-4 h-4 text-red-500" />
              Empresas Inativas
            </Button>
          </div>
        )}
      </div>

      {/* Produção Interna */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => toggleCompany(null)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Factory className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-lg">Produção Interna</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Produtos da própria fábrica
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-3">
              <Badge variant="secondary">
                {getProductsByCompany(null).length} produtos
              </Badge>
              {/* Mobile: seta sempre para baixo */}
              <ChevronDown className="w-5 h-5 cursor-pointer block md:hidden" />
              {/* Desktop: seta para baixo se expandido, para direita se fechado */}
              {expandedCompanies.has(0) ? (
                <ChevronDown className="w-5 h-5 cursor-pointer hidden md:block" />
              ) : (
                <ChevronRight className="w-5 h-5 cursor-pointer hidden md:block" />
              )}
            </div>
          </div>
        </CardHeader>

        {expandedCompanies.has(0) && (
          <CardContent>
            <ProductsList
              products={getVisibleProducts(null)}
              allProducts={getProductsByCompany(null)}
              companyId={null}
              productFilter={productFilters[0] || ""}
              onProductFilterChange={(companyId, filter) => {
                setProductFilters((prev) => ({
                  ...prev,
                  [companyId || 0]: filter,
                }));
                // Resetar paginação quando aplicar filtro
                if (filter !== productFilters[companyId || 0]) {
                  resetPagination(companyId);
                }
              }}
              onLoadMore={() => loadMoreProducts(null)}
              onLoadLess={() => loadLessProducts(null)}
              isScrollEnabled={scrollEnabled[0] || false}
              onEditProduct={onEditProduct}
              onDeleteProduct={onDeleteProduct}
              onAddProduction={onAddProduction}
              onShowProductionHistory={onShowProductionHistory}
              productionQuantities={productionQuantities}
              productionDates={productionDates}
              productionNotes={productionNotes}
              onProductionQuantityChange={onProductionQuantityChange}
              onProductionDateChange={onProductionDateChange}
              onProductionNotesChange={onProductionNotesChange}
              isProductionMode={isProductionMode}
              isActionLoading={isActionLoading}
              deletingProducts={deletingProducts}
              processingProducts={processingProducts}
            />
          </CardContent>
        )}
      </Card>

      {/* Empresas */}
      {companies.map((company) => (
        <Card key={company.id}>
          <CardHeader className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => toggleCompany(company.id)}
              >
                <Building2 className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Empresa parceira
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-3">
                <Badge variant={company.isActive ? "default" : "secondary"}>
                  {company.isActive ? "Ativa" : "Inativa"}
                </Badge>
                <Badge variant="secondary">
                  {getProductsByCompany(company.id).length} produtos
                </Badge>
                {isProductionMode && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompanyStatus(company.id, !company.isActive);
                      }}
                      className="h-8 w-8 p-0"
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : company.isActive ? (
                        <PowerOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <Power className="w-4 h-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCompany(company.id);
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
                {/* Mobile: seta sempre para baixo */}
                <ChevronDown className="w-5 h-5 cursor-pointer block md:hidden" />
                {/* Desktop: seta para baixo se expandido, para direita se fechado */}
                {expandedCompanies.has(company.id) ? (
                  <ChevronDown className="w-5 h-5 cursor-pointer hidden md:block" />
                ) : (
                  <ChevronRight className="w-5 h-5 cursor-pointer hidden md:block" />
                )}
              </div>
            </div>
          </CardHeader>

          {expandedCompanies.has(company.id) && (
            <CardContent>
              <ProductsList
                products={getVisibleProducts(company.id)}
                allProducts={getProductsByCompany(company.id)}
                companyId={company.id}
                productFilter={productFilters[company.id] || ""}
                onProductFilterChange={(companyId, filter) => {
                  setProductFilters((prev) => ({
                    ...prev,
                    [companyId || 0]: filter,
                  }));
                  // Resetar paginação quando aplicar filtro
                  if (filter !== productFilters[companyId || 0]) {
                    resetPagination(companyId);
                  }
                }}
                onLoadMore={() => loadMoreProducts(company.id)}
                onLoadLess={() => loadLessProducts(company.id)}
                isScrollEnabled={scrollEnabled[company.id] || false}
                onEditProduct={onEditProduct}
                onDeleteProduct={onDeleteProduct}
                onAddProduction={onAddProduction}
                onShowProductionHistory={onShowProductionHistory}
                productionQuantities={productionQuantities}
                productionDates={productionDates}
                productionNotes={productionNotes}
                onProductionQuantityChange={onProductionQuantityChange}
                onProductionDateChange={onProductionDateChange}
                onProductionNotesChange={onProductionNotesChange}
                isProductionMode={isProductionMode}
                isActionLoading={isActionLoading}
                deletingProducts={deletingProducts}
                processingProducts={processingProducts}
              />
            </CardContent>
          )}
        </Card>
      ))}

      {companies.length === 0 && getProductsByCompany(null).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece cadastrando produtos para ver a listagem organizada por
              empresa.
            </p>
            {isProductionMode && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={onAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
                <Button onClick={onAddCompany} variant="outline">
                  <Building2 className="w-4 h-4 mr-2" />
                  Adicionar Empresa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ProductsListProps {
  products: Product[];
  allProducts: Product[];
  companyId: number | null;
  productFilter: string;
  onProductFilterChange: (companyId: number | null, filter: string) => void;
  onLoadMore: () => void;
  onLoadLess: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onAddProduction: (productId: number) => void;
  onShowProductionHistory: (productId: number, productName: string) => void;
  productionQuantities: { [key: number]: number };
  productionDates: { [key: number]: string };
  productionNotes: { [key: number]: string };
  onProductionQuantityChange: (productId: number, quantity: number) => void;
  onProductionDateChange: (productId: number, date: string) => void;
  onProductionNotesChange: (productId: number, notes: string) => void;
  isProductionMode: boolean;
  isActionLoading?: boolean;
  deletingProducts?: Set<number>;
  processingProducts?: Set<number>;
  isScrollEnabled?: boolean;
}

function ProductsList({
  products,
  allProducts,
  companyId,
  productFilter,
  onProductFilterChange,
  onLoadMore,
  onLoadLess,
  onEditProduct,
  onDeleteProduct,
  onAddProduction,
  onShowProductionHistory,
  productionQuantities,
  productionDates,
  productionNotes,
  onProductionQuantityChange,
  onProductionDateChange,
  onProductionNotesChange,
  isProductionMode,
  isActionLoading = false,
  deletingProducts = new Set(),
  processingProducts = new Set(),
  isScrollEnabled = false,
}: ProductsListProps & {
  deletingProducts?: Set<number>;
  processingProducts?: Set<number>;
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Produtos filtrados (usando todos os produtos, não apenas os visíveis)
  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(productFilter.toLowerCase()) ||
      product.category.toLowerCase().includes(productFilter.toLowerCase()) ||
      (product.size &&
        product.size.toLowerCase().includes(productFilter.toLowerCase()))
  );

  // Produtos visíveis após filtro
  const visibleFilteredProducts = filteredProducts.slice(0, products.length);

  if (products.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Nenhum produto cadastrado
      </div>
    );
  }

  if (productFilter && filteredProducts.length === 0) {
    return (
      <div className="space-y-3">
        {/* Filtro de produtos - sempre visível */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <label className="text-sm font-medium">Filtrar produtos:</label>
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder="Buscar por nome, categoria ou tamanho..."
              value={productFilter}
              onChange={(e) => onProductFilterChange(companyId, e.target.value)}
              className="max-w-xs"
            />
            {productFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onProductFilterChange(companyId, "")}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-center py-4 text-muted-foreground">
          Nenhum produto encontrado com o filtro "{productFilter}"
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtro de produtos */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <label className="text-sm font-medium">Filtrar produtos:</label>
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Buscar por nome, categoria ou tamanho..."
            value={productFilter}
            onChange={(e) => onProductFilterChange(companyId, e.target.value)}
            className="max-w-xs"
          />
          {productFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onProductFilterChange(companyId, "")}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Container com scroll */}
      <div
        className={`space-y-3 ${
          isScrollEnabled
            ? "max-h-80 md:max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2"
            : ""
        }`}
      >
        {isScrollEnabled && (
          <div className="text-xs text-muted-foreground text-center py-1 bg-gray-50 dark:bg-gray-800/50 rounded border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              📜 Use a rolagem para ver mais produtos
            </span>
          </div>
        )}
        {visibleFilteredProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{product.name}</h4>
                  <Badge variant="outline">{product.category}</Badge>
                  {product.size && (
                    <Badge variant="secondary">{product.size}</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Estoque:</span>{" "}
                    {product.stockQuantity}
                  </div>
                  <div>
                    <span className="font-medium">Custo:</span>{" "}
                    {formatCurrency(product.costPrice)}
                  </div>
                  <div>
                    <span className="font-medium">Venda:</span>{" "}
                    {formatCurrency(product.salePrice)}
                  </div>
                  <div>
                    <span className="font-medium">Margem:</span>{" "}
                    {product.costPrice > 0
                      ? `${(
                          ((product.salePrice - product.costPrice) /
                            product.costPrice) *
                          100
                        ).toFixed(1)}%`
                      : "N/A"}
                  </div>
                </div>
              </div>

              {isProductionMode && (
                <div className={`flex gap-2 ml-4 flex-col md:flex-row`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditProduct(product)}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                    ) : (
                      "Editar"
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteProduct(product.id)}
                    disabled={
                      isActionLoading || deletingProducts.has(product.id)
                    }
                  >
                    {deletingProducts.has(product.id) ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      "Excluir"
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Seção de Produção - apenas no modo produção */}
            {isProductionMode && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Factory className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    Adicionar Produção
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onShowProductionHistory(product.id, product.name)
                    }
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
                      value={productionQuantities[product.id] || ""}
                      onChange={(e) =>
                        onProductionQuantityChange(
                          product.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 h-8 text-xs"
                    />
                    <Input
                      type="date"
                      value={
                        productionDates[product.id] || getCurrentDateString()
                      }
                      onChange={(e) =>
                        onProductionDateChange(product.id, e.target.value)
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
                        onProductionNotesChange(product.id, e.target.value)
                      }
                      className="flex-1 h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => onAddProduction(product.id)}
                      disabled={
                        !productionQuantities[product.id] ||
                        productionQuantities[product.id] <= 0 ||
                        isActionLoading ||
                        processingProducts.has(product.id)
                      }
                      className="text-xs px-3 py-1 h-8"
                    >
                      {processingProducts.has(product.id) ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      ) : (
                        <Plus className="w-3 h-3 mr-1" />
                      )}
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botões de paginação */}
      {!productFilter && allProducts.length > 4 && (
        <div className="flex flex-col items-center gap-2 mt-4">
          {/* Informação sobre a paginação */}
          <div className="text-sm text-muted-foreground">
            <span className="text-gray-600 dark:text-gray-400">
              {isScrollEnabled
                ? `📜 ${products.length} produtos carregados (use a rolagem)`
                : `Mostrando ${products.length} de ${allProducts.length} produtos`}
            </span>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-center gap-2">
            {/* Botão "Ver menos" - só aparece se tem mais de 4 produtos visíveis */}
            {products.length > 4 && (
              <Button
                variant="outline"
                onClick={onLoadLess}
                disabled={isActionLoading}
                className="flex items-center gap-2"
              >
                {isActionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
                {isScrollEnabled ? "Voltar para 4" : "Ver menos"}
              </Button>
            )}

            {/* Botão "Ver mais" - só aparece se ainda há produtos para carregar */}
            {allProducts.length > products.length && (
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isActionLoading}
                className="flex items-center gap-2"
              >
                {isActionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
                {isScrollEnabled
                  ? `Carregar mais (${
                      allProducts.length - products.length
                    } restantes)`
                  : `Ver mais produtos (${
                      allProducts.length - products.length
                    } restantes)`}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
