import { useState, useEffect } from "react";
import { useToast } from "@/hooks/shared/use-toast";
import type { Customer } from "@/lib/prisma";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const fetchCustomersWithFilter = async (filters: { name?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append("name", filters.name);

      const response = await fetch(`/api/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const deleteCustomer = async (id: number) => {
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
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    fetchCustomers,
    fetchCustomersWithFilter,
    deleteCustomer,
  };
}
