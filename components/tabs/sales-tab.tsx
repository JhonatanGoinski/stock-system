import { useState } from "react";
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
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [visibleSales, setVisibleSales] = useState(5);

  const handleSalesFilterChange = (filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    fetchSalesWithFilter(filters);
    setVisibleSales(5); // Reset paginação quando filtrar
  };

  const handleSalesFilterClear = () => {
    fetchSales();
    setVisibleSales(5); // Reset paginação quando limpar filtros
  };

  const canShowVerMenos = visibleSales > 5;
  const canShowVerMais = sales.length > visibleSales;

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
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.slice(0, visibleSales).map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.product?.name || "Produto não encontrado"}
                    </TableCell>
                    <TableCell>
                      {sale.product?.company?.name || "Produção Interna"}
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
          </div>
          {sales.length > 0 && (
            <div className="bg-muted/40 border-t px-4 py-3 rounded-b flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                Mostrando {Math.min(visibleSales, sales.length)} de{" "}
                {sales.length} vendas
                <br />
                {sales.length > 5 && (
                  <>
                    Toque em <b>"Ver Mais"</b> para carregar mais vendas
                  </>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                {canShowVerMenos && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1"
                    onClick={() => setVisibleSales(5)}
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
                    onClick={() => setVisibleSales((prev) => prev + 5)}
                  >
                    <ChevronDown className="w-4 h-4" />
                    Ver Mais {Math.min(5, sales.length - visibleSales)} Vendas
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
