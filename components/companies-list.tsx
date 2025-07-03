import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Factory,
  Package,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Input } from "./ui/input";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Dialog, DialogContent } from "./ui/dialog";

interface Company {
  id: number;
  name: string;
  description?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  _count: {
    products: number;
  };
}

interface CompaniesListProps {
  onCompanySelect: (companyId: number | null, companyName: string) => void;
  onAddCompany: () => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
  selectedCompanyId: number | null;
}

export function CompaniesList({
  onCompanySelect,
  onAddCompany,
  onEditCompany,
  onDeleteCompany,
  selectedCompanyId,
}: CompaniesListProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/companies");

      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        setError("Erro ao carregar empresas");
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      setError("Erro ao carregar empresas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Recarregar lista
        fetchCompanies();
        // Se a empresa deletada era a selecionada, voltar para produção interna
        if (selectedCompanyId === company.id) {
          onCompanySelect(null, "Produção Interna");
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao excluir empresa");
      }
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      alert("Erro ao excluir empresa");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Empresas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Carregando empresas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Empresas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Empresas
        </CardTitle>
        <Button onClick={onAddCompany} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Produção Interna */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedCompanyId === null
                ? "bg-primary/10 border-primary"
                : "bg-card hover:bg-muted/50"
            }`}
            onClick={() => onCompanySelect(null, "Produção Interna")}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                <Factory className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Produção Interna</h3>
                <p className="text-sm text-muted-foreground">
                  Produtos da própria fábrica
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Produtos internos
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Empresas */}
          {companies.map((company) => (
            <div
              key={company.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedCompanyId === company.id
                  ? "bg-primary/10 border-primary"
                  : "bg-card hover:bg-muted/50"
              }`}
              onClick={() => onCompanySelect(company.id, company.name)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{company.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {company.cnpj && (
                      <span className="text-xs text-muted-foreground">
                        CNPJ: {company.cnpj}
                      </span>
                    )}
                    {company.phone && (
                      <span className="text-xs text-muted-foreground">
                        • {company.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Package className="w-3 h-3 mr-1" />
                  {company._count.products} produtos
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCompany(company);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Tem certeza que deseja excluir a empresa "${company.name}"?`
                        )
                      ) {
                        handleDeleteCompany(company);
                      }
                    }}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}

          {companies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma empresa cadastrada</p>
              <p className="text-sm">Clique em "Nova Empresa" para começar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CompaniesInactiveListProps {
  open: boolean;
  onClose: () => void;
  companies: any[];
  loading: boolean;
  filter: string;
  onFilterChange: (value: string) => void;
  onReactivate: (companyId: number) => void;
  onFetch: (filter: string, page: number) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}

export function CompaniesInactiveList({
  open,
  onClose,
  companies,
  loading,
  filter,
  onFilterChange,
  onReactivate,
  onFetch,
  page,
  setPage,
  pageSize,
}: CompaniesInactiveListProps) {
  useEffect(() => {
    if (open) {
      onFetch(filter, 1);
      setPage(1);
    }
    // eslint-disable-next-line
  }, [open]);

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(e.target.value);
    onFetch(e.target.value, 1);
    setPage(1);
  };

  const handleVerMais = () => {
    onFetch(filter, page + 1);
    setPage(page + 1);
  };

  // Conteúdo da lista (usado tanto no modal quanto no drawer)
  const content = (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-center">Empresas Inativas</h2>
      <Input
        placeholder="Buscar empresa..."
        value={filter}
        onChange={handleFilter}
        className="mb-4 h-11 text-base"
      />
      <div className="space-y-2 flex-1 overflow-y-auto pb-2">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Carregando...
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma empresa inativa encontrada.
          </div>
        ) : (
          companies.slice(0, page * pageSize).map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between border rounded px-3 py-3 bg-gray-50 dark:bg-gray-800 gap-2"
            >
              <div>
                <div className="font-medium text-base">{company.name}</div>
                <div className="text-xs text-muted-foreground">
                  {company.email || ""}
                </div>
              </div>
              <Button
                size="lg"
                className="h-10 px-4"
                onClick={() => onReactivate(company.id)}
              >
                Reativar
              </Button>
            </div>
          ))
        )}
      </div>
      {companies.length > page * pageSize && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="lg"
            className="h-10 px-6"
            onClick={handleVerMais}
          >
            Ver mais
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Modal centralizado para todas as telas */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full max-h-[90vh] flex flex-col">
          <button
            className="absolute top-2 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
          {content}
        </DialogContent>
      </Dialog>
    </>
  );
}
