"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { customerSchema, type CustomerInput } from "@/lib/validations"
import type { Customer } from "@/lib/prisma"

interface CustomerFormProps {
  customer?: Customer
  onSuccess: () => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
          document: customer.document || "",
          address: customer.address || "",
          city: customer.city || "",
          state: customer.state || "",
          zip_code: customer.zipCode || "",
          notes: customer.notes || "",
          is_active: customer.isActive,
        }
      : {
          is_active: true,
        },
  })

  const isActive = watch("is_active")

  const onSubmit = async (data: CustomerInput) => {
    setIsLoading(true)
    try {
      const url = customer ? `/api/customers/${customer.id}` : "/api/customers"
      const method = customer ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar cliente")
      }

      onSuccess()
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao salvar cliente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{customer ? "Editar Cliente" : "Adicionar Cliente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" {...register("name")} placeholder="Nome do cliente" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...register("phone")} placeholder="(11) 99999-9999" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">CPF/CNPJ</Label>
                <Input id="document" {...register("document")} placeholder="000.000.000-00" />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input id="address" {...register("address")} placeholder="Rua, número, complemento" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" {...register("city")} placeholder="São Paulo" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" {...register("state")} placeholder="SP" maxLength={2} />
                  {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input id="zip_code" {...register("zip_code")} placeholder="00000-000" />
                </div>
              </div>
            </div>
          </div>

          {/* Observações e Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Adicionais</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Informações adicionais sobre o cliente..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <Label htmlFor="is_active">Cliente Ativo</Label>
              </div>
            </div>
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
  )
}
