import { Button } from "@/components/shared/ui/button";
import { Package, Factory, Plus } from "lucide-react";
import { TopProductionRanking } from "@/components/products/top-production-ranking";
import { CompaniesProductsList } from "@/components/products/companies-products-list";
import { ProductionHistory } from "@/components/products/production-history";
import { useProducts } from "@/hooks/products/use-products";
import { useProduction } from "@/hooks/products/use-production";
import { useCompanies } from "@/hooks/companies/use-companies";
import { useDashboardContext } from "@/hooks/dashboard/use-dashboard-context";
import type { Product } from "@/lib/prisma";

interface ProductsTabProps {
  onAddProduct: () => void;
  onAddCompany: () => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (productId: number) => void;
  onShowProductionHistory: (productId: number, productName: string) => void;
  onShowInactiveCompanies: () => void;
  onEditCompany: (company: any) => void;
  showProductionHistory: boolean;
  selectedProductForHistory: { id: number; name: string } | null;
  onCloseProductionHistory: () => void;
  isActionLoading: boolean;
}

export function ProductsTab({
  onAddProduct,
  onAddCompany,
  onEditProduct,
  onDeleteProduct,
  onShowProductionHistory,
  onShowInactiveCompanies,
  onEditCompany,
  showProductionHistory,
  selectedProductForHistory,
  onCloseProductionHistory,
  isActionLoading,
}: ProductsTabProps) {
  const {
    products,
    isProductsLoading,
    deletingProducts,
    fetchProducts,
    updateProduct,
  } = useProducts();
  const {
    productionMode,
    setProductionMode,
    productionQuantities,
    productionDates,
    productionNotes,
    handleProductionQuantityChange,
    handleProductionDateChange,
    handleProductionNotesChange,
    handleAddProduction,
    processingProducts,
  } = useProduction();
  const {
    companies,
    handleToggleCompanyStatus,
    handleDeleteCompany,
    updateCompany,
    removeCompany,
  } = useCompanies();
  // Removido triggerSoftRefresh pois agora usamos atualização local

  const handleAddProductionWithRefresh = async (productId: number) => {
    const success = await handleAddProduction(
      productId,
      () => {
        // Não fazer refresh, apenas atualizar localmente
      },
      (updatedProduct) => {
        console.log("🔄 Atualizando produto localmente:", updatedProduct);
        updateProduct(updatedProduct);
      }
    );
    return success;
  };

  const handleToggleCompanyStatusWithRefresh = async (
    companyId: number,
    isActive: boolean
  ) => {
    const success = await handleToggleCompanyStatus(
      companyId,
      isActive,
      () => {
        // Não fazer refresh, apenas atualizar localmente
      },
      (updatedCompany) => {
        console.log("🔄 Atualizando empresa localmente:", updatedCompany);
        updateCompany(updatedCompany);
      }
    );
    return success;
  };

  const handleDeleteCompanyWithRefresh = async (companyId: number) => {
    const success = await handleDeleteCompany(
      companyId,
      () => {
        // Não fazer refresh, apenas atualizar localmente
      },
      (removedCompanyId) => {
        console.log("🔄 Removendo empresa localmente:", removedCompanyId);
        removeCompany(removedCompanyId);
      }
    );
    return success;
  };

  if (isProductsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">
          {productionMode ? "Produção" : "Produtos"}
        </h2>
        <ProductsHeaderActions
          productionMode={productionMode}
          setProductionMode={setProductionMode}
          setShowProductForm={onAddProduct}
        />
      </div>

      {/* Ranking de produtos mais produzidos - apenas no modo normal */}
      {!productionMode && (
        <div className="mb-6">
          <TopProductionRanking />
        </div>
      )}

      {/* Lista de produtos organizada por empresa */}
      <CompaniesProductsList
        onAddProduct={onAddProduct}
        onAddCompany={onAddCompany}
        onShowInactiveCompanies={onShowInactiveCompanies}
        onEditProduct={onEditProduct}
        onDeleteProduct={onDeleteProduct}
        onAddProduction={handleAddProductionWithRefresh}
        processingProducts={processingProducts}
        onShowProductionHistory={onShowProductionHistory}
        onToggleCompanyStatus={handleToggleCompanyStatusWithRefresh}
        onDeleteCompany={handleDeleteCompanyWithRefresh}
        onEditCompany={onEditCompany}
        productionQuantities={productionQuantities}
        productionDates={productionDates}
        productionNotes={productionNotes}
        onProductionQuantityChange={handleProductionQuantityChange}
        onProductionDateChange={handleProductionDateChange}
        onProductionNotesChange={handleProductionNotesChange}
        isProductionMode={productionMode}
        deletingProducts={deletingProducts}
        isActionLoading={isActionLoading}
        products={products}
        companies={companies}
        onRefresh={fetchProducts}
      />

      {/* Modal de Histórico de Produção */}
      {showProductionHistory && selectedProductForHistory && (
        <ProductionHistory
          productId={selectedProductForHistory.id}
          productName={selectedProductForHistory.name}
          onClose={onCloseProductionHistory}
        />
      )}
    </>
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
      {productionMode && (
        <Button
          onClick={() => setShowProductForm(true)}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      )}
    </div>
  );
}
