import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface DashboardContextType {
  triggerRefresh: () => void;
  isActionLoading: boolean;
  setIsActionLoading: (loading: boolean) => void;
  // Estado de produtos
  products: any[];
  setProducts: (products: any[]) => void;
  addProduct: (product: any) => void;
  updateProduct: (product: any) => void;
  removeProduct: (productId: number) => void;
  // Estado de empresas
  companies: any[];
  setCompanies: (companies: any[]) => void;
  addCompany: (company: any) => void;
  updateCompany: (company: any) => void;
  removeCompany: (companyId: number) => void;
  // Listeners para atualizações
  addProductListener: (listener: (products: any[]) => void) => void;
  addCompanyListener: (listener: (companies: any[]) => void) => void;
  removeProductListener: (listener: (products: any[]) => void) => void;
  removeCompanyListener: (listener: (companies: any[]) => void) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [products, setProductsState] = useState<any[]>([]);
  const [companies, setCompaniesState] = useState<any[]>([]);

  // Listeners para atualizações
  const [productListeners, setProductListeners] = useState<
    ((products: any[]) => void)[]
  >([]);
  const [companyListeners, setCompanyListeners] = useState<
    ((companies: any[]) => void)[]
  >([]);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Funções para produtos
  const setProducts = useCallback(
    (newProducts: any[]) => {
      console.log(
        "🔄 DashboardContext: Atualizando produtos:",
        newProducts.length
      );
      setProductsState(newProducts);
      // Notificar todos os listeners
      productListeners.forEach((listener) => listener(newProducts));
    },
    [productListeners]
  );

  const addProduct = useCallback(
    (product: any) => {
      console.log("🔄 DashboardContext: Adicionando produto:", product);
      setProductsState((prev) => {
        const newProducts = [...prev, product];
        // Notificar todos os listeners
        productListeners.forEach((listener) => listener(newProducts));
        return newProducts;
      });
    },
    [productListeners]
  );

  const updateProduct = useCallback(
    (updatedProduct: any) => {
      console.log("🔄 DashboardContext: Atualizando produto:", updatedProduct);
      setProductsState((prev) => {
        const newProducts = prev.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        );
        // Notificar todos os listeners
        productListeners.forEach((listener) => listener(newProducts));
        return newProducts;
      });
    },
    [productListeners]
  );

  const removeProduct = useCallback(
    (productId: number) => {
      console.log("🔄 DashboardContext: Removendo produto:", productId);
      setProductsState((prev) => {
        const newProducts = prev.filter((product) => product.id !== productId);
        // Notificar todos os listeners
        productListeners.forEach((listener) => listener(newProducts));
        return newProducts;
      });
    },
    [productListeners]
  );

  // Funções para empresas
  const setCompanies = useCallback(
    (newCompanies: any[]) => {
      console.log(
        "🔄 DashboardContext: Atualizando empresas:",
        newCompanies.length
      );
      setCompaniesState(newCompanies);
      // Notificar todos os listeners
      companyListeners.forEach((listener) => listener(newCompanies));
    },
    [companyListeners]
  );

  const addCompany = useCallback(
    (company: any) => {
      console.log("🔄 DashboardContext: Adicionando empresa:", company);
      setCompaniesState((prev) => {
        const newCompanies = [...prev, company];
        // Notificar todos os listeners
        companyListeners.forEach((listener) => listener(newCompanies));
        return newCompanies;
      });
    },
    [companyListeners]
  );

  const updateCompany = useCallback(
    (updatedCompany: any) => {
      console.log("🔄 DashboardContext: Atualizando empresa:", updatedCompany);
      setCompaniesState((prev) => {
        const newCompanies = prev.map((company) =>
          company.id === updatedCompany.id ? updatedCompany : company
        );
        // Notificar todos os listeners
        companyListeners.forEach((listener) => listener(newCompanies));
        return newCompanies;
      });
    },
    [companyListeners]
  );

  const removeCompany = useCallback(
    (companyId: number) => {
      console.log("🔄 DashboardContext: Removendo empresa:", companyId);
      setCompaniesState((prev) => {
        const newCompanies = prev.filter((company) => company.id !== companyId);
        // Notificar todos os listeners
        companyListeners.forEach((listener) => listener(newCompanies));
        return newCompanies;
      });
    },
    [companyListeners]
  );

  // Funções para gerenciar listeners
  const addProductListener = useCallback(
    (listener: (products: any[]) => void) => {
      setProductListeners((prev) => [...prev, listener]);
    },
    []
  );

  const addCompanyListener = useCallback(
    (listener: (companies: any[]) => void) => {
      setCompanyListeners((prev) => [...prev, listener]);
    },
    []
  );

  const removeProductListener = useCallback(
    (listener: (products: any[]) => void) => {
      setProductListeners((prev) => prev.filter((l) => l !== listener));
    },
    []
  );

  const removeCompanyListener = useCallback(
    (listener: (companies: any[]) => void) => {
      setCompanyListeners((prev) => prev.filter((l) => l !== listener));
    },
    []
  );

  return (
    <DashboardContext.Provider
      value={{
        triggerRefresh,
        isActionLoading,
        setIsActionLoading,
        products,
        setProducts,
        addProduct,
        updateProduct,
        removeProduct,
        companies,
        setCompanies,
        addCompany,
        updateCompany,
        removeCompany,
        addProductListener,
        addCompanyListener,
        removeProductListener,
        removeCompanyListener,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider"
    );
  }
  return context;
}
