import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/use-toast";
import { useDashboardContext } from "@/hooks/dashboard/use-dashboard-context";
import type { Product } from "@/lib/prisma";

export function useProducts() {
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [deletingProducts, setDeletingProducts] = useState<Set<number>>(
    new Set()
  );
  const { toast } = useToast();
  const {
    products: contextProducts,
    setProducts: setContextProducts,
    addProduct: addContextProduct,
    updateProduct: updateContextProduct,
    removeProduct: removeContextProduct,
    addProductListener,
    removeProductListener,
  } = useDashboardContext();

  const fetchProducts = async () => {
    try {
      setIsProductsLoading(true);
      console.log("📡 Buscando produtos atualizados...");

      const response = await fetch("/api/products", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      console.log(
        "📡 Resposta da API produtos:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Produtos recebidos:", data.length, "produtos");
        setLocalProducts(data);
        setContextProducts(data);
      } else {
        console.error("❌ Erro na resposta da API produtos:", response.status);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    // Adicionar produto ao set de produtos sendo deletados
    setDeletingProducts((prev) => new Set(prev).add(id));

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Produto deletado!",
          description: "O produto foi removido com sucesso.",
          variant: "success",
        });
        // Atualizar estado local removendo o produto
        removeContextProduct(id);
        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao deletar produto",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar produto",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      // Remover produto do set de produtos sendo deletados
      setDeletingProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Listener para atualizações do contexto
  const productListener = useCallback((updatedProducts: Product[]) => {
    console.log(
      "🔄 Hook useProducts: Recebendo atualização de produtos:",
      updatedProducts.length
    );
    setLocalProducts(updatedProducts);
  }, []);

  useEffect(() => {
    // Registrar listener
    addProductListener(productListener);

    // Cleanup
    return () => {
      removeProductListener(productListener);
    };
  }, [addProductListener, removeProductListener, productListener]);

  // Sincronizar produtos locais com o contexto quando o contexto mudar
  useEffect(() => {
    if (contextProducts.length > 0) {
      console.log(
        "🔄 Sincronizando produtos locais com contexto:",
        contextProducts.length
      );
      setLocalProducts(contextProducts);
    }
  }, [contextProducts]);

  // Usar produtos locais como fonte principal
  const products = localProducts;

  const addProduct = (newProduct: Product) => {
    addContextProduct(newProduct);
  };

  const updateProduct = (updatedProduct: Product) => {
    console.log("🔄 Hook useProducts: Atualizando produto:", updatedProduct);
    updateContextProduct(updatedProduct);
    // Também atualizar localmente para resposta imediata
    setLocalProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const refreshProducts = () => {
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Carregar apenas uma vez

  return {
    products,
    isProductsLoading,
    deletingProducts,
    fetchProducts,
    deleteProduct,
    addProduct,
    updateProduct,
    refreshProducts,
  };
}
