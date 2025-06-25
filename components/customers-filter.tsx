"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, Users } from "lucide-react";

interface CustomersFilterProps {
  onFilterChange: (filters: { name?: string }) => void;
  onClearFilters: () => void;
}

export function CustomersFilter({
  onFilterChange,
  onClearFilters,
}: CustomersFilterProps) {
  const [nameFilter, setNameFilter] = useState("");

  const handleApplyFilter = () => {
    if (nameFilter.trim()) {
      onFilterChange({ name: nameFilter.trim() });
    }
  };

  const handleClearFilters = () => {
    setNameFilter("");
    onClearFilters();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyFilter();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Filtros de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nameFilter">Nome do Cliente</Label>
          <div className="flex gap-2">
            <Input
              id="nameFilter"
              type="text"
              placeholder="Digite o nome do cliente..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleApplyFilter}
              disabled={!nameFilter.trim()}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Buscar
            </Button>
            {nameFilter && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            A busca é feita por nome parcial (case-insensitive)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
