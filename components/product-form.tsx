"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productSchema, type ProductInput } from "@/lib/validations";
import type { Product } from "@/lib/prisma";
import { useToast } from "@/hooks/use-toast";
import { Building2, Factory } from "lucide-react";

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const categories = [
  "camiseta",
  "calca",
  "bermuda",
  "blusa",
  "vestido",
  "jaqueta",
  "sapato",
  "acessorio",
];

export function ProductForm({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || "",
          category: product.category,
          size: product.size || "",
          cost_price: Number(product.costPrice),
          sale_price: Number(product.salePrice),
          stock_quantity: product.stockQuantity,
          company_id: product.companyId || null,
        }
      : {
          cost_price: 0,
          sale_price: 0,
          stock_quantity: 0,
          company_id: null,
        },
  });

  const selectedCategory = watch("category");
  const selectedCompanyId = watch("company_id");
  const selectedCompanyValue = selectedCompanyId
    ? selectedCompanyId.toString()
    : "internal";

  // Buscar empresas
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companies");
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        }
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const onSubmit = async (data: ProductInput) => {
    setIsLoading(true);
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar produto");
      }

      toast({
        title: product ? "Produto atualizado!" : "Produto cadastrado!",
        description: product
          ? "O produto foi atualizado com sucesso."
          : "O produto foi cadastrado com sucesso.",
        variant: "success",
      });
      onSuccess();
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao salvar produto",
        description:
          error instanceof Error ? error.message : "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {product ? "Editar Produto" : "Adicionar Produto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nome do produto"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descrição do produto"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_id">Empresa</Label>
            <Select
              value={selectedCompanyValue}
              onValueChange={(value) =>
                setValue(
                  "company_id",
                  value === "internal" ? null : Number(value)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa ou deixe para produção interna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4" />
                    Produção Interna
                  </div>
                </SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {company.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Deixe em branco para produtos da própria fábrica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Tamanho</Label>
              <Input
                id="size"
                {...register("size")}
                placeholder="P, M, G, 38, 40..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Preço de Custo *</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                {...register("cost_price", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.cost_price && (
                <p className="text-sm text-red-500">
                  {errors.cost_price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Preço de Venda *</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                {...register("sale_price", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.sale_price && (
                <p className="text-sm text-red-500">
                  {errors.sale_price.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Quantidade em Estoque *</Label>
            <Input
              id="stock_quantity"
              type="number"
              {...register("stock_quantity", { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.stock_quantity && (
              <p className="text-sm text-red-500">
                {errors.stock_quantity.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
