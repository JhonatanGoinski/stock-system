import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { SalesFilter } from "@/components/sales/sales-filter";
import { useSales } from "@/hooks/sales/use-sales";
import { formatCurrency } from "@/lib/utils";
import type { SaleWithDetails } from "@/lib/prisma";

interface SalesTabProps {
  onAddSale: () => void;
  onDeleteSale: (sale: SaleWithDetails) => void;
}

export function SalesTab({ onAddSale, onDeleteSale }: SalesTabProps) {
  const { sales, fetchSalesWithFilter, fetchSales } = useSales();

  const handleSalesFilterChange = (filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    fetchSalesWithFilter(filters);
  };

  const handleSalesFilterClear = () => {
    fetchSales();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Vendas</h2>
        <Button onClick={onAddSale}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      <SalesFilter
        onFilterChange={handleSalesFilterChange}
        onClearFilters={handleSalesFilterClear}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {sale.product?.name || "Produto não encontrado"}
                  </TableCell>
                  <TableCell>
                    {sale.customer?.name || "Cliente não encontrado"}
                  </TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>
                    {formatCurrency(Number(sale.totalAmount))}
                  </TableCell>
                  <TableCell>
                    {typeof sale.saleDate === "string" && sale.saleDate
                      ? String(sale.saleDate)
                          .split("T")[0]
                          .split("-")
                          .reverse()
                          .join("/")
                      : ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteSale(sale)}
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
