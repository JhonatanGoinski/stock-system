import { Dialog, DialogContent } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { ProductForm } from "@/components/products/product-form";
import { CustomerForm } from "@/components/customers/customer-form";
import { SaleForm } from "@/components/sales/sale-form";
import { CompanyForm } from "@/components/companies/company-form";
import { ProductionHistory } from "@/components/products/production-history";
import { CompaniesInactiveList } from "@/components/companies/companies-list";
import type {
  Product,
  CustomerWithDetails,
  SaleWithDetails,
} from "@/lib/prisma";

interface DashboardModalsProps {
  // Estados dos modais
  showProductForm: boolean;
  showCustomerForm: boolean;
  showSaleForm: boolean;
  showCompanyForm: boolean;
  showProductionHistory: boolean;
  showDeleteModal: boolean;
  showInactiveCompanies: boolean;
  selectedProductForHistory: { id: number; name: string } | null;
  editingProduct: Product | null;
  editingCustomer: CustomerWithDetails | null;
  editingCompany: any;
  itemToDelete: any;
  deleteType: "product" | "customer" | "sale" | null;
  inactiveCompanies: any[];
  inactiveCompaniesLoading: boolean;
  inactiveCompaniesFilter: string;
  inactiveCompaniesPage: number;
  INACTIVE_COMPANIES_PAGE_SIZE: number;

  // Handlers para fechar modais
  onCloseProductForm: () => void;
  onCloseCustomerForm: () => void;
  onCloseSaleForm: () => void;
  onCloseCompanyForm: () => void;
  onCloseProductionHistory: () => void;
  onCloseDeleteModal: () => void;
  onCloseInactiveCompanies: () => void;

  // Handlers para sucesso dos formulários
  onProductFormSuccess: (newProduct?: Product) => void;
  onCustomerFormSuccess: (newCustomer?: CustomerWithDetails) => void;
  onSaleFormSuccess: (newSale?: SaleWithDetails) => void;
  onCompanyFormSuccess: (updatedCompany?: any) => void;

  // Handlers para deletar
  onDeleteProduct: (id: number) => Promise<void>;
  onDeleteCustomer: (id: number) => Promise<void>;
  onDeleteSale: (id: number) => Promise<void>;

  // Handlers para empresas inativas
  onInactiveCompaniesFilterChange: (filter: string) => void;
  onReactivateCompany: (companyId: number) => Promise<void>;
  onFetchInactiveCompanies: (filter: string, page: number) => void;
  onInactiveCompaniesPageChange: (page: number) => void;
}

export function DashboardModals({
  // Estados dos modais
  showProductForm,
  showCustomerForm,
  showSaleForm,
  showCompanyForm,
  showProductionHistory,
  showDeleteModal,
  showInactiveCompanies,
  selectedProductForHistory,
  editingProduct,
  editingCustomer,
  editingCompany,
  itemToDelete,
  deleteType,
  inactiveCompanies,
  inactiveCompaniesLoading,
  inactiveCompaniesFilter,
  inactiveCompaniesPage,
  INACTIVE_COMPANIES_PAGE_SIZE,

  // Handlers para fechar modais
  onCloseProductForm,
  onCloseCustomerForm,
  onCloseSaleForm,
  onCloseCompanyForm,
  onCloseProductionHistory,
  onCloseDeleteModal,
  onCloseInactiveCompanies,

  // Handlers para sucesso dos formulários
  onProductFormSuccess,
  onCustomerFormSuccess,
  onSaleFormSuccess,
  onCompanyFormSuccess,

  // Handlers para deletar
  onDeleteProduct,
  onDeleteCustomer,
  onDeleteSale,

  // Handlers para empresas inativas
  onInactiveCompaniesFilterChange,
  onReactivateCompany,
  onFetchInactiveCompanies,
  onInactiveCompaniesPageChange,
}: DashboardModalsProps) {
  return (
    <>
      {/* Formulário de Produtos */}
      <Dialog
        open={showProductForm}
        onOpenChange={(open) => {
          if (!open) {
            onCloseProductForm();
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
              onSuccess={onProductFormSuccess}
              onCancel={onCloseProductForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Formulário de Clientes */}
      <Dialog
        open={showCustomerForm}
        onOpenChange={(open) => {
          if (!open) {
            onCloseCustomerForm();
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
              onSuccess={onCustomerFormSuccess}
              onCancel={onCloseCustomerForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Formulário de Vendas */}
      <Dialog
        open={showSaleForm}
        onOpenChange={(open) => {
          if (!open) onCloseSaleForm();
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {showSaleForm && (
            <SaleForm
              onSuccess={onSaleFormSuccess}
              onCancel={onCloseSaleForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Formulário de Empresas */}
      <Dialog
        open={showCompanyForm}
        onOpenChange={(open) => {
          if (!open) onCloseCompanyForm();
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {showCompanyForm && (
            <CompanyForm
              company={editingCompany || undefined}
              onSuccess={(updatedCompany) =>
                onCompanyFormSuccess(updatedCompany)
              }
              onCancel={onCloseCompanyForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico de Produção */}
      {showProductionHistory && selectedProductForHistory && (
        <ProductionHistory
          productId={selectedProductForHistory.id}
          productName={selectedProductForHistory.name}
          onClose={onCloseProductionHistory}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      <Dialog open={showDeleteModal} onOpenChange={onCloseDeleteModal}>
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
            <Button variant="outline" onClick={onCloseDeleteModal}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                onCloseDeleteModal();
                if (deleteType === "product" && itemToDelete) {
                  await onDeleteProduct(itemToDelete.id);
                }
                if (deleteType === "customer" && itemToDelete) {
                  await onDeleteCustomer(itemToDelete.id);
                }
                if (deleteType === "sale" && itemToDelete) {
                  await onDeleteSale(itemToDelete.id);
                }
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
        onClose={onCloseInactiveCompanies}
        companies={inactiveCompanies}
        loading={inactiveCompaniesLoading}
        filter={inactiveCompaniesFilter}
        onFilterChange={onInactiveCompaniesFilterChange}
        onReactivate={onReactivateCompany}
        onFetch={onFetchInactiveCompanies}
        page={inactiveCompaniesPage}
        setPage={onInactiveCompaniesPageChange}
        pageSize={INACTIVE_COMPANIES_PAGE_SIZE}
      />
    </>
  );
}
