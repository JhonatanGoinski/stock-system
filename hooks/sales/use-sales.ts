import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/use-toast";
import { useDashboardContext } from "@/hooks/dashboard/use-dashboard-context";
import type { SaleWithDetails } from "@/lib/prisma";

export function useSales() {
  const [localSales, setLocalSales] = useState<SaleWithDetails[]>([]);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [deletingSales, setDeletingSales] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const {
    sales: contextSales,
    setSales: setContextSales,
    addSale: addContextSale,
    updateSale: updateContextSale,
    removeSale: removeContextSale,
    addSaleListener,
    removeSaleListener,
  } = useDashboardContext();

  const fetchSales = async () => {
    try {
      setIsSalesLoading(true);
      console.log("📡 Buscando vendas atualizadas...");

      const response = await fetch("/api/sales", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      console.log(
        "📡 Resposta da API vendas:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Vendas recebidas:", data.length, "vendas");
        setLocalSales(data);
        setContextSales(data);
      } else {
        console.error("❌ Erro na resposta da API vendas:", response.status);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar vendas:", error);
    } finally {
      setIsSalesLoading(false);
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
        setLocalSales(data);
        setContextSales(data);
      } else {
        console.error("Erro na resposta da API de vendas:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  };

  const deleteSale = async (id: number) => {
    // Adicionar venda ao set de vendas sendo deletadas
    setDeletingSales((prev) => new Set(prev).add(id));

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
        // Atualizar estado local removendo a venda
        removeContextSale(id);
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
    } finally {
      // Remover venda do set de vendas sendo deletadas
      setDeletingSales((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Listener para atualizações do contexto
  const saleListener = useCallback((updatedSales: SaleWithDetails[]) => {
    console.log(
      "🔄 Hook useSales: Recebendo atualização de vendas:",
      updatedSales.length
    );
    setLocalSales(updatedSales);
  }, []);

  useEffect(() => {
    // Registrar listener
    addSaleListener(saleListener);

    // Cleanup
    return () => {
      removeSaleListener(saleListener);
    };
  }, [addSaleListener, removeSaleListener, saleListener]);

  // Sincronizar vendas locais com o contexto quando o contexto mudar
  useEffect(() => {
    if (contextSales.length > 0) {
      console.log(
        "🔄 Sincronizando vendas locais com contexto:",
        contextSales.length
      );
      setLocalSales(contextSales);
    }
  }, [contextSales]);

  // Usar vendas locais como fonte principal
  const sales = localSales;

  const addSale = (newSale: SaleWithDetails) => {
    console.log("🔄 Hook useSales: Adicionando venda:", newSale);
    console.log("🔄 Tipo da venda:", typeof newSale);
    console.log("🔄 Estrutura da venda:", JSON.stringify(newSale, null, 2));
    addContextSale(newSale);
  };

  const updateSale = (updatedSale: SaleWithDetails) => {
    console.log("🔄 Hook useSales: Atualizando venda:", updatedSale);
    console.log("🔄 Tipo da venda:", typeof updatedSale);
    console.log("🔄 Estrutura da venda:", JSON.stringify(updatedSale, null, 2));
    updateContextSale(updatedSale);
    // Também atualizar localmente para resposta imediata
    setLocalSales((prev) =>
      prev.map((sale) => (sale.id === updatedSale.id ? updatedSale : sale))
    );
  };

  const refreshSales = () => {
    fetchSales();
  };

  useEffect(() => {
    fetchSales();
  }, []); // Carregar apenas uma vez

  return {
    sales,
    isSalesLoading,
    deletingSales,
    fetchSales,
    fetchSalesWithFilter,
    deleteSale,
    addSale,
    updateSale,
    refreshSales,
  };
}
