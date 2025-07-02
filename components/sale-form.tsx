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
import { saleSchema, type SaleInput } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";
import type { Product, Customer } from "@/lib/prisma";

interface SaleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function SaleForm({ onSuccess, onCancel }: SaleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      quantity: 1,
      unit_price: 0,
      discount: 0,
    },
  });

  const selectedProductId = watch("product_id");
  const selectedCustomerId = watch("customer_id");
  const quantity = watch("quantity");
  const unitPrice = watch("unit_price");
  const discount = watch("discount") || 0;

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p.id === selectedProductId);
      setSelectedProduct(product || null);
      if (product) {
        setValue("unit_price", Number(product.salePrice));
      }
    }
  }, [selectedProductId, products, setValue]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.filter((p: Product) => p.stockQuantity > 0));
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers?active=true");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const onSubmit = async (data: SaleInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao registrar venda");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro:", error);
      alert(error instanceof Error ? error.message : "Erro ao registrar venda");
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = quantity * unitPrice;
  const totalAmount = subtotal - discount;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Venda</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="customer_id">Cliente</Label>
            <Select
              value={selectedCustomerId?.toString() || "0"}
              onValueChange={(value) =>
                setValue("customer_id", value ? Number.parseInt(value) : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Venda Balcão (sem cliente)</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name} {customer.email && `(${customer.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Produto */}
          <div className="space-y-2">
            <Label htmlFor="product_id">Produto *</Label>
            <Select
              value={selectedProductId?.toString() || "0"}
              onValueChange={(value) =>
                setValue("product_id", Number.parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} - {product.category}
                    {product.size && ` (${product.size})`} - Estoque:{" "}
                    {product.stockQuantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product_id && (
              <p className="text-sm text-red-500">
                {errors.product_id.message}
              </p>
            )}
          </div>

          {selectedProduct && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Produto selecionado:</strong> {selectedProduct.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Preço sugerido:</strong>{" "}
                {formatCurrency(Number(selectedProduct.salePrice))}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Estoque disponível:</strong>{" "}
                {selectedProduct.stockQuantity} unidades
              </p>
            </div>
          )}

          {/* Quantidade e Preço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedProduct?.stockQuantity || 999}
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Preço Unitário *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                {...register("unit_price", { valueAsNumber: true })}
              />
              {errors.unit_price && (
                <p className="text-sm text-red-500">
                  {errors.unit_price.message}
                </p>
              )}
            </div>
          </div>

          {/* Desconto */}
          <div className="space-y-2">
            <Label htmlFor="discount">Desconto (R$)</Label>
            <Input
              id="discount"
              type="number"
              step="0.01"
              min="0"
              max={subtotal}
              {...register("discount", { valueAsNumber: true })}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Observações sobre a venda..."
              rows={2}
            />
          </div>

          {/* Data da Venda */}
          <div className="space-y-2">
            <Label htmlFor="sale_date">Data da Venda *</Label>
            <Input
              id="sale_date"
              type="date"
              {...register("sale_date", { required: true })}
              defaultValue={new Date().toLocaleDateString("en-CA")}
            />
            {errors.sale_date && (
              <p className="text-sm text-red-500">{errors.sale_date.message}</p>
            )}
          </div>

          {/* Resumo da Venda */}
          {quantity > 0 && unitPrice > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold text-blue-800 dark:text-blue-200 border-t pt-2">
                <span>Total da Venda:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || !selectedProduct}>
              {isLoading ? "Registrando..." : "Registrar Venda"}
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
