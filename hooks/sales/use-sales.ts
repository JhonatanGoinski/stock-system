import { useState, useEffect } from "react";
import { useToast } from "@/hooks/shared/use-toast";
import type { SaleWithDetails } from "@/lib/prisma";

export function useSales() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const { toast } = useToast();

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales");
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      } else {
        console.error("Erro na resposta da API de vendas:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  };

  const fetchSalesWithFilter = async (filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append("date", filters.date);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/sales?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      } else {
        console.error("Erro na resposta da API de vendas:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  };

  const deleteSale = async (id: number) => {
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Venda deletada!",
          description: "A venda foi removida e o estoque restaurado.",
          variant: "success",
        });
        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao deletar venda",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar venda",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    fetchSales,
    fetchSalesWithFilter,
    deleteSale,
  };
}
