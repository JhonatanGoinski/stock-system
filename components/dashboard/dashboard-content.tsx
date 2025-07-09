import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/ui/tabs";
import { BarChart3, Package, Users, ShoppingCart } from "lucide-react";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ProductsTab } from "@/components/tabs/products-tab";
import { CustomersTab } from "@/components/tabs/customers-tab";
import { SalesTab } from "@/components/tabs/sales-tab";
import { ReportsPage } from "@/components/reports/reports-page";
import { DashboardModals } from "@/components/shared/modals/dashboard-modals";
import { MobileTabs } from "@/components/shared/mobile-tabs";
import { useProducts } from "@/hooks/products/use-products";
import { useCustomers } from "@/hooks/customers/use-customers";
import { useSales } from "@/hooks/sales/use-sales";
import { useProduction } from "@/hooks/products/use-production";
import { useCompanies } from "@/hooks/companies/use-companies";
import { useDashboardContext } from "@/hooks/dashboard/use-dashboard-context";
import type {
  Product,
  CustomerWithDetails,
  SaleWithDetails,
} from "@/lib/prisma";

interface DashboardContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardContent({
  activeTab,
  setActiveTab,
}: DashboardContentProps) {
  // Estados dos modais
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showProductionHistory, setShowProductionHistory] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerWithDetails | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<
    "product" | "customer" | "sale" | null
  >(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [showInactiveCompanies, setShowInactiveCompanies] = useState(false);

  // Hooks customizados
  const { products, fetchProducts, deleteProduct } = useProducts();
  const { addProduct, updateProduct } = useDashboardContext();
  const {
    customers,
    fetchCustomers,
    deleteCustomer,
    addCustomer,
    updateCustomer,
  } = useCustomers();
  const { sales, fetchSales, deleteSale, addSale, updateSale } = useSales();
  const { productionMode } = useProduction();
  const { triggerRefresh, isActionLoading, setIsActionLoading } =
    useDashboardContext();
  const {
    inactiveCompanies,
    inactiveCompaniesFilter,
    setInactiveCompaniesFilter,
    inactiveCompaniesPage,
    setInactiveCompaniesPage,
    inactiveCompaniesLoading,
    INACTIVE_COMPANIES_PAGE_SIZE,
    fetchInactiveCompanies,
    handleReactivateCompany,
  } = useCompanies();

  // Handlers para modais
  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleCloseCustomerForm = () => {
    setShowCustomerForm(false);
    setEditingCustomer(null);
  };

  const handleCloseSaleForm = () => {
    setShowSaleForm(false);
  };

  const handleCloseCompanyForm = () => {
    setShowCompanyForm(false);
  };

  const handleCloseProductionHistory = () => {
    setShowProductionHistory(false);
    setSelectedProductForHistory(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setDeleteType(null);
  };

  const handleCloseInactiveCompanies = () => {
    setShowInactiveCompanies(false);
  };

  // Handlers para sucesso dos formulários
  const handleProductFormSuccess = (newProduct?: Product) => {
    console.log("🔄 handleProductFormSuccess chamado com:", newProduct);
    console.log("🔄 editingProduct:", editingProduct);

    handleCloseProductForm();

    // Se temos um produto novo/atualizado, adicionar/atualizar no estado local
    if (newProduct) {
      console.log("🔄 Atualizando produto no estado local:", newProduct);
      if (editingProduct) {
        // Atualizar produto existente
        console.log("🔄 Atualizando produto existente");
        updateProduct(newProduct);
      } else {
        // Adicionar novo produto
        console.log("🔄 Adicionando novo produto");
        addProduct(newProduct);
      }
    }

    setIsActionLoading(true);
    setTimeout(() => setIsActionLoading(false), 1000);
  };

  const handleCustomerFormSuccess = (newCustomer?: CustomerWithDetails) => {
    console.log("🔄 handleCustomerFormSuccess chamado com:", newCustomer);
    console.log("🔄 editingCustomer:", editingCustomer);
    console.log("🔄 Tipo do newCustomer:", typeof newCustomer);
    console.log(
      "🔄 Estrutura do newCustomer:",
      JSON.stringify(newCustomer, null, 2)
    );

    handleCloseCustomerForm();

    // Se temos um cliente novo/atualizado, adicionar/atualizar no estado local
    if (newCustomer) {
      console.log("🔄 Atualizando cliente no estado local:", newCustomer);
      if (editingCustomer) {
        // Atualizar cliente existente
        console.log("🔄 Atualizando cliente existente");
        updateCustomer(newCustomer);
      } else {
        // Adicionar novo cliente
        console.log("🔄 Adicionando novo cliente");
        addCustomer(newCustomer);
      }
    }

    setIsActionLoading(true);
    setTimeout(() => setIsActionLoading(false), 1000);
  };

  const handleSaleFormSuccess = (newSale?: SaleWithDetails) => {
    console.log("🔄 handleSaleFormSuccess chamado com:", newSale);
    console.log("🔄 Tipo do newSale:", typeof newSale);
    console.log("🔄 Estrutura do newSale:", JSON.stringify(newSale, null, 2));

    handleCloseSaleForm();

    // Se temos uma venda nova, adicionar ao estado local
    if (newSale) {
      console.log("🔄 Adicionando nova venda:", newSale);
      addSale(newSale);
    }

    setIsActionLoading(true);
    setTimeout(() => setIsActionLoading(false), 1000);
  };

  const handleCompanyFormSuccess = () => {
    handleCloseCompanyForm();
    setIsActionLoading(true);
    triggerRefresh();
    setTimeout(() => setIsActionLoading(false), 1000);
  };

  // Handlers para deletar
  const handleDeleteProductWithRefresh = async (id: number) => {
    const success = await deleteProduct(id);
    if (success) {
      // O deleteProduct já atualiza o estado local, não precisa de refresh
      setIsActionLoading(true);
      setTimeout(() => setIsActionLoading(false), 1000);
    }
  };

  const handleDeleteCustomerWithRefresh = async (id: number) => {
    const success = await deleteCustomer(id);
    if (success) {
      // O deleteCustomer já atualiza o estado local, não precisa de refresh
      setIsActionLoading(true);
      setTimeout(() => setIsActionLoading(false), 1000);
    }
  };

  const handleDeleteSaleWithRefresh = async (id: number) => {
    const success = await deleteSale(id);
    if (success) {
      // O deleteSale já atualiza o estado local, não precisa de refresh
      setIsActionLoading(true);
      setTimeout(() => setIsActionLoading(false), 1000);
    }
  };

  // Handlers para produtos
  const handleAddProduct = () => {
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: number) => {
    const product = products.find((p: Product) => p.id === productId);
    setItemToDelete(product);
    setDeleteType("product");
    setShowDeleteModal(true);
  };

  const handleShowProductionHistory = (
    productId: number,
    productName: string
  ) => {
    setSelectedProductForHistory({
      id: productId,
      name: productName,
    });
    setShowProductionHistory(true);
  };

  const handleAddCompany = () => {
    setShowCompanyForm(true);
  };

  const handleShowInactiveCompanies = () => {
    setShowInactiveCompanies(true);
  };

  // Handlers para clientes
  const handleAddCustomer = () => {
    setShowCustomerForm(true);
  };

  const handleEditCustomer = (customer: CustomerWithDetails) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = (customer: CustomerWithDetails) => {
    setItemToDelete(customer);
    setDeleteType("customer");
    setShowDeleteModal(true);
  };

  // Handlers para vendas
  const handleAddSale = () => {
    setShowSaleForm(true);
  };

  const handleDeleteSale = (sale: SaleWithDetails) => {
    setItemToDelete(sale);
    setDeleteType("sale");
    setShowDeleteModal(true);
  };

  // Handlers para empresas inativas
  const handleInactiveCompaniesFilterChange = (filter: string) => {
    setInactiveCompaniesFilter(filter);
  };

  const handleReactivateCompanyWithRefresh = async (companyId: number) => {
    const success = await handleReactivateCompany(companyId);
    if (success) {
      triggerRefresh();
    }
  };

  const handleFetchInactiveCompanies = (filter: string, page: number) => {
    fetchInactiveCompanies(filter, page);
  };

  const handleInactiveCompaniesPageChange = (page: number) => {
    setInactiveCompaniesPage(page);
  };

  // Handler para trocar de aba
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="px-4 py-4 pb-20 md:pb-4 md:container md:mx-auto md:px-6 md:pt-6">
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
              <TabsTrigger value="products" className="flex items-center gap-2">
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
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Vendas
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardStats />
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <ProductsTab
                onAddProduct={handleAddProduct}
                onAddCompany={handleAddCompany}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onShowProductionHistory={handleShowProductionHistory}
                onShowInactiveCompanies={handleShowInactiveCompanies}
                showProductionHistory={showProductionHistory}
                selectedProductForHistory={selectedProductForHistory}
                onCloseProductionHistory={handleCloseProductionHistory}
                isActionLoading={isActionLoading}
              />
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <CustomersTab
                onAddCustomer={handleAddCustomer}
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <SalesTab
                onAddSale={handleAddSale}
                onDeleteSale={handleDeleteSale}
              />
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
            <ProductsTab
              onAddProduct={handleAddProduct}
              onAddCompany={handleAddCompany}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onShowProductionHistory={handleShowProductionHistory}
              onShowInactiveCompanies={handleShowInactiveCompanies}
              showProductionHistory={showProductionHistory}
              selectedProductForHistory={selectedProductForHistory}
              onCloseProductionHistory={handleCloseProductionHistory}
              isActionLoading={isActionLoading}
            />
          )}
          {activeTab === "customers" && (
            <CustomersTab
              onAddCustomer={handleAddCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}
          {activeTab === "sales" && (
            <SalesTab
              onAddSale={handleAddSale}
              onDeleteSale={handleDeleteSale}
            />
          )}
          {activeTab === "reports" && <ReportsPage />}
          <MobileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Modais */}
      <DashboardModals
        showProductForm={showProductForm}
        showCustomerForm={showCustomerForm}
        showSaleForm={showSaleForm}
        showCompanyForm={showCompanyForm}
        showProductionHistory={showProductionHistory}
        showDeleteModal={showDeleteModal}
        showInactiveCompanies={showInactiveCompanies}
        selectedProductForHistory={selectedProductForHistory}
        editingProduct={editingProduct}
        editingCustomer={editingCustomer}
        itemToDelete={itemToDelete}
        deleteType={deleteType}
        inactiveCompanies={inactiveCompanies}
        inactiveCompaniesLoading={inactiveCompaniesLoading}
        inactiveCompaniesFilter={inactiveCompaniesFilter}
        inactiveCompaniesPage={inactiveCompaniesPage}
        INACTIVE_COMPANIES_PAGE_SIZE={INACTIVE_COMPANIES_PAGE_SIZE}
        onCloseProductForm={handleCloseProductForm}
        onCloseCustomerForm={handleCloseCustomerForm}
        onCloseSaleForm={handleCloseSaleForm}
        onCloseCompanyForm={handleCloseCompanyForm}
        onCloseProductionHistory={handleCloseProductionHistory}
        onCloseDeleteModal={handleCloseDeleteModal}
        onCloseInactiveCompanies={handleCloseInactiveCompanies}
        onProductFormSuccess={handleProductFormSuccess}
        onCustomerFormSuccess={handleCustomerFormSuccess}
        onSaleFormSuccess={handleSaleFormSuccess}
        onCompanyFormSuccess={handleCompanyFormSuccess}
        onDeleteProduct={handleDeleteProductWithRefresh}
        onDeleteCustomer={handleDeleteCustomerWithRefresh}
        onDeleteSale={handleDeleteSaleWithRefresh}
        onInactiveCompaniesFilterChange={handleInactiveCompaniesFilterChange}
        onReactivateCompany={handleReactivateCompanyWithRefresh}
        onFetchInactiveCompanies={handleFetchInactiveCompanies}
        onInactiveCompaniesPageChange={handleInactiveCompaniesPageChange}
      />
    </>
  );
}
