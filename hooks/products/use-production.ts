import { useState } from "react";
import { useToast } from "@/hooks/shared/use-toast";
import { getCurrentDateString } from "@/lib/utils";

export function useProduction() {
  const [productionMode, setProductionMode] = useState(false);
  const [productionQuantities, setProductionQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [productionDates, setProductionDates] = useState<{
    [key: number]: string;
  }>({});
  const [productionNotes, setProductionNotes] = useState<{
    [key: number]: string;
  }>({});
  const [processingProducts, setProcessingProducts] = useState<Set<number>>(
    new Set()
  );
  const { toast } = useToast();
  // Removido triggerSoftRefresh para evitar loops

  const handleProductionQuantityChange = (
    productId: number,
    quantity: number
  ) => {
    setProductionQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, quantity), // Não permite valores negativos
    }));
  };

  const handleProductionDateChange = (productId: number, date: string) => {
    // Usar exatamente a data selecionada, sem conversões de timezone
    setProductionDates((prev) => ({
      ...prev,
      [productId]: date,
    }));
  };

  const handleProductionNotesChange = (productId: number, notes: string) => {
    setProductionNotes((prev) => ({
      ...prev,
      [productId]: notes,
    }));
  };

  const handleAddProduction = async (
    productId: number,
    onSuccess?: () => void,
    onProductUpdate?: (updatedProduct: any) => void
  ) => {
    const quantity = productionQuantities[productId] || 0;
    // Usar a data selecionada ou a data atual no formato YYYY-MM-DD
    const productionDate = productionDates[productId] || getCurrentDateString();
    const notes = productionNotes[productId] || "";

    if (quantity <= 0) {
      toast({
        title: "Quantidade inválida",
        description:
          "Por favor, insira uma quantidade válida para adicionar ao estoque.",
        variant: "destructive",
      });
      return false;
    }

    // Evitar múltiplas chamadas simultâneas
    if (processingProducts.has(productId)) {
      return false;
    }

    setProcessingProducts((prev) => new Set(prev).add(productId));

    try {
      console.log(
        "📡 Adicionando produção:",
        productId,
        quantity,
        productionDate,
        notes
      );

      const response = await fetch(`/api/products/${productId}/production`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity, productionDate, notes }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Produção registrada, resultado:", result);

        toast({
          title: "Produção registrada!",
          description: "A quantidade foi adicionada ao estoque com sucesso.",
          variant: "success",
        });

        // Chamar callback de sucesso se fornecido
        if (onSuccess) {
          onSuccess();
        }

        // Atualizar o produto localmente se callback fornecido
        if (onProductUpdate && result.product) {
          console.log("🔄 Chamando callback de atualização:", result.product);
          onProductUpdate(result.product);
        }

        // Limpar os campos imediatamente
        setProductionQuantities((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
        setProductionDates((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
        setProductionNotes((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });

        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao adicionar produção",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar produção",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const clearProductionFields = (productId: number) => {
    setProductionQuantities((prev) => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
    setProductionDates((prev) => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
    setProductionNotes((prev) => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  return {
    productionMode,
    setProductionMode,
    productionQuantities,
    productionDates,
    productionNotes,
    handleProductionQuantityChange,
    handleProductionDateChange,
    handleProductionNotesChange,
    handleAddProduction,
    clearProductionFields,
    processingProducts,
  };
}
