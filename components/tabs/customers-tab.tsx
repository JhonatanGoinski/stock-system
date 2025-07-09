import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { CustomersFilter } from "@/components/customers/customers-filter";
import { useCustomers } from "@/hooks/customers/use-customers";
import type { Customer } from "@/lib/prisma";

interface CustomersTabProps {
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
}

export function CustomersTab({
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
}: CustomersTabProps) {
  const { customers, fetchCustomersWithFilter, fetchCustomers } =
    useCustomers();
  const [visibleCustomers, setVisibleCustomers] = useState(5);

  const handleCustomersFilterChange = (filters: { name?: string }) => {
    fetchCustomersWithFilter(filters);
    setVisibleCustomers(5); // Reset paginação quando filtrar
  };

  const handleCustomersFilterClear = () => {
    fetchCustomers();
    setVisibleCustomers(5); // Reset paginação quando limpar filtros
  };

  const canShowVerMenos = visibleCustomers > 5;
  const canShowVerMais = customers.length > visibleCustomers;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Clientes</h2>
        <Button onClick={onAddCustomer}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>

      <CustomersFilter
        onFilterChange={handleCustomersFilterChange}
        onClearFilters={handleCustomersFilterClear}
      />

      <Card>
        <CardContent className="p-0">
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.slice(0, visibleCustomers).map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.isActive ? "default" : "secondary"}
                      >
                        {customer.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteCustomer(customer)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {customers.length > 0 && (
            <div className="bg-muted/40 border-t px-4 py-3 rounded-b flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                Mostrando {Math.min(visibleCustomers, customers.length)} de{" "}
                {customers.length} clientes
                <br />
                {customers.length > 5 && (
                  <>
                    Toque em <b>"Ver Mais"</b> para carregar mais clientes
                  </>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                {canShowVerMenos && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1"
                    onClick={() => setVisibleCustomers(5)}
                  >
                    <ChevronUp className="w-4 h-4" />
                    Ver Menos
                  </Button>
                )}
                {canShowVerMais && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1"
                    onClick={() => setVisibleCustomers((prev) => prev + 5)}
                  >
                    <ChevronDown className="w-4 h-4" />
                    Ver Mais {Math.min(
                      5,
                      customers.length - visibleCustomers
                    )}{" "}
                    Clientes
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
