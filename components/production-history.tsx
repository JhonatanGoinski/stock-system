"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Package,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";

interface ProductionRecord {
  id: number;
  productId: number;
  quantity: number;
  productionDate: string;
  notes: string | null;
  createdAt: string;
  product: {
    name: string;
  };
}

interface ProductionHistoryProps {
  productId: number;
  productName: string;
  onClose: () => void;
}

export function ProductionHistory({
  productId,
  productName,
  onClose,
}: ProductionHistoryProps) {
  const [history, setHistory] = useState<ProductionRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ProductionRecord[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const RECORDS_PER_PAGE = 5;

  useEffect(() => {
    fetchHistory();
  }, [productId]);

  useEffect(() => {
    applyFilters();
  }, [history, startDate, endDate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/production`);

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        setError("Erro ao carregar histórico");
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      setError("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    if (startDate || endDate) {
      console.log("🔍 Aplicando filtros:", {
        startDate,
        endDate,
        totalRecords: history.length,
      });

      filtered = filtered.filter((record) => {
        // Usar diretamente o productionDate que já está no formato DD/MM/YYYY
        const [day, month, year] = record.productionDate.split("/");
        const recordDateString = `${year}-${month.padStart(
          2,
          "0"
        )}-${day.padStart(2, "0")}`;

        let matches = true;

        if (startDate) {
          matches = matches && recordDateString >= startDate;
        }

        if (endDate) {
          matches = matches && recordDateString <= endDate;
        }

        console.log("📅 Comparando:", {
          recordDate: record.productionDate,
          recordDateString,
          startDate,
          endDate,
          matches,
        });

        return matches;
      });
    }

    setFilteredHistory(filtered);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setShowFilters(false);
  };

  const totalProduced = filteredHistory.reduce(
    (sum, record) => sum + record.quantity,
    0
  );
  const displayedHistory = filteredHistory.slice(0, displayLimit);
  const hasMoreRecords = filteredHistory.length > displayLimit;
  const hasShownMore = displayLimit > RECORDS_PER_PAGE;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-6">
            <div className="text-center">Carregando histórico...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Histórico de Produção
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{productName}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              Total: {totalProduced} unidades
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <>
              {/* Filtros */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filtros</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-xs"
                  >
                    {showFilters ? (
                      <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 mr-1" />
                        Mostrar
                      </>
                    )}
                  </Button>
                </div>

                {showFilters && (
                  <div className="space-y-3">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Data Inicial
                        </label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Data Final
                        </label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="h-8 text-xs"
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                    {(startDate || endDate) && (
                      <div className="text-xs text-muted-foreground">
                        {filteredHistory.length} registros encontrados
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Lista de Histórico */}
              {filteredHistory.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  Nenhum registro de produção encontrado.
                </div>
              ) : (
                <div className="max-h-[50vh] overflow-y-auto">
                  <div className="divide-y">
                    {displayedHistory.map((record) => (
                      <div key={record.id} className="p-4 hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {record.productionDate}
                            </span>
                          </div>
                          <Badge variant="outline">
                            +{record.quantity} unidades
                          </Badge>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {record.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Registrado em: {record.createdAt}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Botões de Paginação */}
                  {(hasMoreRecords || hasShownMore) && (
                    <div className="p-4 border-t flex gap-2">
                      {hasMoreRecords && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            setDisplayLimit(displayLimit + RECORDS_PER_PAGE)
                          }
                          className="flex-1 text-xs"
                        >
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Ver Mais ({filteredHistory.length - displayLimit}{" "}
                          restantes)
                        </Button>
                      )}
                      {hasShownMore && (
                        <Button
                          variant="ghost"
                          onClick={() => setDisplayLimit(RECORDS_PER_PAGE)}
                          className="text-xs"
                        >
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Ver Menos
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
