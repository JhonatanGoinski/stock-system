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
import { Plus, Edit, Trash2 } from "lucide-react";
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

  const handleCustomersFilterChange = (filters: { name?: string }) => {
    fetchCustomersWithFilter(filters);
  };

  const handleCustomersFilterClear = () => {
    fetchCustomers();
  };

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
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
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
        </CardContent>
      </Card>
    </>
  );
}
