"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search, X } from "lucide-react";

interface SalesFilterProps {
  onFilterChange: (filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  onClearFilters: () => void;
}

export function SalesFilter({
  onFilterChange,
  onClearFilters,
}: SalesFilterProps) {
  const [dateFilter, setDateFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState<"single" | "range">("single");

  const handleApplyFilter = () => {
    if (filterType === "single" && dateFilter) {
      onFilterChange({ date: dateFilter });
    } else if (filterType === "range" && startDate && endDate) {
      onFilterChange({ startDate, endDate });
    }
  };

  const handleClearFilters = () => {
    setDateFilter("");
    setStartDate("");
    setEndDate("");
    onClearFilters();
  };

  const hasActiveFilters = dateFilter || (startDate && endDate);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtros de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de filtro */}
        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="filterType"
              value="single"
              checked={filterType === "single"}
              onChange={() => setFilterType("single")}
              className="rounded"
            />
            <span className="text-sm">Data específica</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="filterType"
              value="range"
              checked={filterType === "range"}
              onChange={() => setFilterType("range")}
              className="rounded"
            />
            <span className="text-sm">Intervalo de datas</span>
          </label>
        </div>

        {/* Filtro por data específica */}
        {filterType === "single" && (
          <div className="space-y-2">
            <Label htmlFor="dateFilter">Data da Venda</Label>
            <Input
              id="dateFilter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>
        )}

        {/* Filtro por intervalo de datas */}
        {filterType === "range" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            onClick={handleApplyFilter}
            disabled={
              (filterType === "single" && !dateFilter) ||
              (filterType === "range" && (!startDate || !endDate))
            }
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Aplicar Filtro
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
