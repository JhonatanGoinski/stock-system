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
import { formatUTCDate } from "@/lib/utils";

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
  const [showAll, setShowAll] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const INITIAL_LIMIT = 5;

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

    if (startDate) {
      filtered = filtered.filter(
        (record) => record.productionDate >= startDate
      );
    }

    if (endDate) {
      filtered = filtered.filter((record) => record.productionDate <= endDate);
    }

    setFilteredHistory(filtered);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setShowFilters(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const totalProduced = filteredHistory.reduce(
    (sum, record) => sum + record.quantity,
    0
  );
  const displayedHistory = showAll
    ? filteredHistory
    : filteredHistory.slice(0, INITIAL_LIMIT);
  const hasMoreRecords = filteredHistory.length > INITIAL_LIMIT;

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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex-1 w-full sm:w-auto">
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Data Inicial
                        </label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-8 text-xs w-full"
                        />
                      </div>
                      <div className="flex-1 w-full sm:w-auto">
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Data Final
                        </label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-8 text-xs w-full"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 text-xs w-full sm:w-auto"
                      >
                        Limpar
                      </Button>
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
                              {formatDate(record.productionDate)}
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
                          Registrado em: {formatDate(record.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Botão Ver Mais */}
                  {hasMoreRecords && (
                    <div className="p-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setShowAll(!showAll)}
                        className="w-full text-xs"
                      >
                        {showAll ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Ver Menos ({INITIAL_LIMIT} registros)
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Ver Mais ({filteredHistory.length -
                              INITIAL_LIMIT}{" "}
                            registros restantes)
                          </>
                        )}
                      </Button>
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
