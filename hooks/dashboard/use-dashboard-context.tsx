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
  // Estado de clientes
  customers: any[];
  setCustomers: (customers: any[]) => void;
  addCustomer: (customer: any) => void;
  updateCustomer: (customer: any) => void;
  removeCustomer: (customerId: number) => void;
  // Estado de vendas
  sales: any[];
  setSales: (sales: any[]) => void;
  addSale: (sale: any) => void;
  updateSale: (sale: any) => void;
  removeSale: (saleId: number) => void;
  // Listeners para atualizações
  addProductListener: (listener: (products: any[]) => void) => void;
  addCompanyListener: (listener: (companies: any[]) => void) => void;
  addCustomerListener: (listener: (customers: any[]) => void) => void;
  addSaleListener: (listener: (sales: any[]) => void) => void;
  removeProductListener: (listener: (products: any[]) => void) => void;
  removeCompanyListener: (listener: (companies: any[]) => void) => void;
  removeCustomerListener: (listener: (customers: any[]) => void) => void;
  removeSaleListener: (listener: (sales: any[]) => void) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [products, setProductsState] = useState<any[]>([]);
  const [companies, setCompaniesState] = useState<any[]>([]);
  const [customers, setCustomersState] = useState<any[]>([]);
  const [sales, setSalesState] = useState<any[]>([]);

  // Listeners para atualizações
  const [productListeners, setProductListeners] = useState<
    ((products: any[]) => void)[]
  >([]);
  const [companyListeners, setCompanyListeners] = useState<
    ((companies: any[]) => void)[]
  >([]);
  const [customerListeners, setCustomerListeners] = useState<
    ((customers: any[]) => void)[]
  >([]);
  const [saleListeners, setSaleListeners] = useState<
    ((sales: any[]) => void)[]
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

  // Funções para clientes
  const setCustomers = useCallback(
    (newCustomers: any[]) => {
      console.log(
        "🔄 DashboardContext: Atualizando clientes:",
        newCustomers.length
      );
      setCustomersState(newCustomers);
      // Notificar todos os listeners
      customerListeners.forEach((listener) => listener(newCustomers));
    },
    [customerListeners]
  );

  const addCustomer = useCallback(
    (customer: any) => {
      console.log("🔄 DashboardContext: Adicionando cliente:", customer);
      console.log("🔄 Tipo do cliente:", typeof customer);
      console.log(
        "🔄 Estrutura do cliente:",
        JSON.stringify(customer, null, 2)
      );
      setCustomersState((prev) => {
        const newCustomers = [...prev, customer];
        // Notificar todos os listeners
        customerListeners.forEach((listener) => listener(newCustomers));
        return newCustomers;
      });
    },
    [customerListeners]
  );

  const updateCustomer = useCallback(
    (updatedCustomer: any) => {
      console.log("🔄 DashboardContext: Atualizando cliente:", updatedCustomer);
      console.log("🔄 Tipo do cliente:", typeof updatedCustomer);
      console.log(
        "🔄 Estrutura do cliente:",
        JSON.stringify(updatedCustomer, null, 2)
      );
      setCustomersState((prev) => {
        const newCustomers = prev.map((customer) =>
          customer.id === updatedCustomer.id ? updatedCustomer : customer
        );
        // Notificar todos os listeners
        customerListeners.forEach((listener) => listener(newCustomers));
        return newCustomers;
      });
    },
    [customerListeners]
  );

  const removeCustomer = useCallback(
    (customerId: number) => {
      console.log("🔄 DashboardContext: Removendo cliente:", customerId);
      setCustomersState((prev) => {
        const newCustomers = prev.filter(
          (customer) => customer.id !== customerId
        );
        // Notificar todos os listeners
        customerListeners.forEach((listener) => listener(newCustomers));
        return newCustomers;
      });
    },
    [customerListeners]
  );

  // Funções para vendas
  const setSales = useCallback(
    (newSales: any[]) => {
      console.log("🔄 DashboardContext: Atualizando vendas:", newSales.length);
      setSalesState(newSales);
      // Notificar todos os listeners
      saleListeners.forEach((listener) => listener(newSales));
    },
    [saleListeners]
  );

  const addSale = useCallback(
    (sale: any) => {
      console.log("🔄 DashboardContext: Adicionando venda:", sale);
      console.log("🔄 Tipo da venda:", typeof sale);
      console.log("🔄 Estrutura da venda:", JSON.stringify(sale, null, 2));
      setSalesState((prev) => {
        const newSales = [...prev, sale];
        // Notificar todos os listeners
        saleListeners.forEach((listener) => listener(newSales));
        return newSales;
      });
    },
    [saleListeners]
  );

  const updateSale = useCallback(
    (updatedSale: any) => {
      console.log("🔄 DashboardContext: Atualizando venda:", updatedSale);
      setSalesState((prev) => {
        const newSales = prev.map((sale) =>
          sale.id === updatedSale.id ? updatedSale : sale
        );
        // Notificar todos os listeners
        saleListeners.forEach((listener) => listener(newSales));
        return newSales;
      });
    },
    [saleListeners]
  );

  const removeSale = useCallback(
    (saleId: number) => {
      console.log("🔄 DashboardContext: Removendo venda:", saleId);
      setSalesState((prev) => {
        const newSales = prev.filter((sale) => sale.id !== saleId);
        // Notificar todos os listeners
        saleListeners.forEach((listener) => listener(newSales));
        return newSales;
      });
    },
    [saleListeners]
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

  const addCustomerListener = useCallback(
    (listener: (customers: any[]) => void) => {
      setCustomerListeners((prev) => [...prev, listener]);
    },
    []
  );

  const addSaleListener = useCallback((listener: (sales: any[]) => void) => {
    setSaleListeners((prev) => [...prev, listener]);
  }, []);

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

  const removeCustomerListener = useCallback(
    (listener: (customers: any[]) => void) => {
      setCustomerListeners((prev) => prev.filter((l) => l !== listener));
    },
    []
  );

  const removeSaleListener = useCallback((listener: (sales: any[]) => void) => {
    setSaleListeners((prev) => prev.filter((l) => l !== listener));
  }, []);

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
        customers,
        setCustomers,
        addCustomer,
        updateCustomer,
        removeCustomer,
        sales,
        setSales,
        addSale,
        updateSale,
        removeSale,
        addProductListener,
        addCompanyListener,
        addCustomerListener,
        addSaleListener,
        removeProductListener,
        removeCompanyListener,
        removeCustomerListener,
        removeSaleListener,
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
