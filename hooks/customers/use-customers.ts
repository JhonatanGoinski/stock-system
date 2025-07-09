import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/use-toast";
import { useDashboardContext } from "@/hooks/dashboard/use-dashboard-context";
import type { CustomerWithDetails } from "@/lib/prisma";

export function useCustomers() {
  const [localCustomers, setLocalCustomers] = useState<CustomerWithDetails[]>(
    []
  );
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [deletingCustomers, setDeletingCustomers] = useState<Set<number>>(
    new Set()
  );
  const { toast } = useToast();
  const {
    customers: contextCustomers,
    setCustomers: setContextCustomers,
    addCustomer: addContextCustomer,
    updateCustomer: updateContextCustomer,
    removeCustomer: removeContextCustomer,
    addCustomerListener,
    removeCustomerListener,
  } = useDashboardContext();

  const fetchCustomers = async () => {
    try {
      setIsCustomersLoading(true);
      console.log("📡 Buscando clientes atualizados...");

      const response = await fetch("/api/customers", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      console.log(
        "📡 Resposta da API clientes:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Clientes recebidos:", data.length, "clientes");
        setLocalCustomers(data);
        setContextCustomers(data);
      } else {
        console.error("❌ Erro na resposta da API clientes:", response.status);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar clientes:", error);
    } finally {
      setIsCustomersLoading(false);
    }
  };

  const fetchCustomersWithFilter = async (filters: { name?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append("name", filters.name);

      const response = await fetch(`/api/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLocalCustomers(data);
        setContextCustomers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const deleteCustomer = async (id: number) => {
    // Adicionar cliente ao set de clientes sendo deletados
    setDeletingCustomers((prev) => new Set(prev).add(id));

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Cliente deletado!",
          description: "O cliente foi removido com sucesso.",
          variant: "success",
        });
        // Atualizar estado local removendo o cliente
        removeContextCustomer(id);
        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao deletar cliente",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar cliente",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      // Remover cliente do set de clientes sendo deletados
      setDeletingCustomers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Listener para atualizações do contexto
  const customerListener = useCallback(
    (updatedCustomers: CustomerWithDetails[]) => {
      console.log(
        "🔄 Hook useCustomers: Recebendo atualização de clientes:",
        updatedCustomers.length
      );
      setLocalCustomers(updatedCustomers);
    },
    []
  );

  useEffect(() => {
    // Registrar listener
    addCustomerListener(customerListener);

    // Cleanup
    return () => {
      removeCustomerListener(customerListener);
    };
  }, [addCustomerListener, removeCustomerListener, customerListener]);

  // Sincronizar clientes locais com o contexto quando o contexto mudar
  useEffect(() => {
    if (contextCustomers.length > 0) {
      console.log(
        "🔄 Sincronizando clientes locais com contexto:",
        contextCustomers.length
      );
      setLocalCustomers(contextCustomers);
    }
  }, [contextCustomers]);

  // Usar clientes locais como fonte principal
  const customers = localCustomers;

  const addCustomer = (newCustomer: CustomerWithDetails) => {
    console.log("🔄 Hook useCustomers: Adicionando cliente:", newCustomer);
    console.log("🔄 Tipo do cliente:", typeof newCustomer);
    console.log(
      "🔄 Estrutura do cliente:",
      JSON.stringify(newCustomer, null, 2)
    );
    addContextCustomer(newCustomer);
  };

  const updateCustomer = (updatedCustomer: CustomerWithDetails) => {
    console.log("�� Hook useCustomers: Atualizando cliente:", updatedCustomer);
    console.log("🔄 Tipo do cliente:", typeof updatedCustomer);
    console.log(
      "🔄 Estrutura do cliente:",
      JSON.stringify(updatedCustomer, null, 2)
    );
    updateContextCustomer(updatedCustomer);
    // Também atualizar localmente para resposta imediata
    setLocalCustomers((prev) =>
      prev.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
  };

  const refreshCustomers = () => {
    fetchCustomers();
  };

  useEffect(() => {
    fetchCustomers();
  }, []); // Carregar apenas uma vez

  return {
    customers,
    isCustomersLoading,
    deletingCustomers,
    fetchCustomers,
    fetchCustomersWithFilter,
    deleteCustomer,
    addCustomer,
    updateCustomer,
    refreshCustomers,
  };
}
