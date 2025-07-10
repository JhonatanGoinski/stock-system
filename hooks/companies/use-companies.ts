import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/use-toast";
import { useDashboardContext } from "@/hooks/dashboard/use-dashboard-context";

export function useCompanies() {
  const [localCompanies, setLocalCompanies] = useState<any[]>([]);
  const [inactiveCompanies, setInactiveCompanies] = useState<any[]>([]);
  const [inactiveCompaniesFilter, setInactiveCompaniesFilter] = useState("");
  const [inactiveCompaniesPage, setInactiveCompaniesPage] = useState(1);
  const [inactiveCompaniesLoading, setInactiveCompaniesLoading] =
    useState(false);
  const INACTIVE_COMPANIES_PAGE_SIZE = 5;
  const { toast } = useToast();

  const {
    companies: contextCompanies,
    setCompanies: setContextCompanies,
    addCompany: addContextCompany,
    updateCompany: updateContextCompany,
    removeCompany: removeContextCompany,
    addCompanyListener,
    removeCompanyListener,
  } = useDashboardContext();

  const fetchInactiveCompanies = async (filter = "", page = 1) => {
    setInactiveCompaniesLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("isActive", "false");
      if (filter) params.append("name", filter);
      params.append("page", String(page));
      params.append("pageSize", String(INACTIVE_COMPANIES_PAGE_SIZE));
      const response = await fetch(`/api/companies?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setInactiveCompanies(data);
      } else {
        setInactiveCompanies([]);
      }
    } catch (e) {
      setInactiveCompanies([]);
    } finally {
      setInactiveCompaniesLoading(false);
    }
  };

  const handleToggleCompanyStatus = async (
    companyId: number,
    isActive: boolean,
    onSuccess?: () => void,
    onCompanyUpdate?: (updatedCompany: any) => void
  ) => {
    try {
      const response = await fetch(
        `/api/companies/${companyId}/toggle-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Status da empresa alterado, resultado:", result);

        toast({
          title: isActive ? "Empresa ativada!" : "Empresa desativada!",
          description: isActive
            ? "A empresa foi ativada e seus produtos estão disponíveis para venda."
            : "A empresa foi desativada e seus produtos não estão mais disponíveis para venda.",
          variant: "success",
        });

        // Chamar callback de sucesso se fornecido
        if (onSuccess) {
          onSuccess();
        }

        // Atualizar empresa localmente se callback fornecido
        if (onCompanyUpdate && result) {
          console.log(
            "🔄 Chamando callback de atualização da empresa:",
            result
          );
          onCompanyUpdate(result);
        }

        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao alterar status da empresa",
          description: errorData.error || "Erro desconhecido.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao alterar status da empresa",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteCompany = async (
    companyId: number,
    onSuccess?: () => void,
    onCompanyRemoved?: (companyId: number) => void
  ) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Empresa deletada, resultado:", result);

        toast({
          title: "Empresa deletada!",
          description: `A empresa "${result.deletedCompany}" foi removida com sucesso.`,
          variant: "success",
        });

        // Chamar callback de sucesso se fornecido
        if (onSuccess) {
          onSuccess();
        }

        // Notificar remoção da empresa se callback fornecido
        if (onCompanyRemoved) {
          console.log("🔄 Chamando callback de remoção da empresa:", companyId);
          onCompanyRemoved(companyId);
        }

        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: errorData.error || "Erro ao deletar empresa",
          description: errorData.message || "Erro desconhecido.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar empresa",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleReactivateCompany = async (companyId: number) => {
    try {
      const response = await fetch(
        `/api/companies/${companyId}/toggle-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        }
      );
      if (response.ok) {
        toast({
          title: "Empresa reativada!",
          description: "A empresa foi reativada com sucesso.",
          variant: "success",
        });
        // Atualizar lista de inativas
        fetchInactiveCompanies(inactiveCompaniesFilter, inactiveCompaniesPage);
        return true;
      } else {
        toast({
          title: "Erro ao reativar empresa",
          description: "Tente novamente.",
          variant: "destructive",
        });
        return false;
      }
    } catch (e) {
      toast({
        title: "Erro ao reativar empresa",
        description: "Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Listener para atualizações do contexto
  const companyListener = useCallback((updatedCompanies: any[]) => {
    console.log(
      "🔄 Hook useCompanies: Recebendo atualização de empresas:",
      updatedCompanies.length
    );
    setLocalCompanies(updatedCompanies);
  }, []);

  useEffect(() => {
    // Registrar listener
    addCompanyListener(companyListener);

    // Cleanup
    return () => {
      removeCompanyListener(companyListener);
    };
  }, [addCompanyListener, removeCompanyListener, companyListener]);

  // Sincronizar empresas locais com o contexto quando o contexto mudar
  useEffect(() => {
    console.log(
      "🔄 Hook useCompanies: Contexto mudou - empresas:",
      contextCompanies.length
    );
    if (contextCompanies.length > 0) {
      console.log(
        "🔄 Sincronizando empresas locais com contexto:",
        contextCompanies.length
      );
      setLocalCompanies(contextCompanies);
    }
  }, [contextCompanies]);

  // Usar empresas locais como fonte principal
  const companies = localCompanies;

  const updateCompany = (updatedCompany: any) => {
    console.log("🔄 Hook useCompanies: Atualizando empresa:", updatedCompany);
    updateContextCompany(updatedCompany);
    // Também atualizar localmente para resposta imediata
    setLocalCompanies((prev) =>
      prev.map((company) =>
        company.id === updatedCompany.id ? updatedCompany : company
      )
    );
  };

  const removeCompany = (companyId: number) => {
    console.log("🔄 Hook useCompanies: Removendo empresa:", companyId);
    removeContextCompany(companyId);
    // Também atualizar localmente para resposta imediata
    setLocalCompanies((prev) =>
      prev.filter((company) => company.id !== companyId)
    );
  };

  const addCompany = (newCompany: any) => {
    console.log("🔄 Hook useCompanies: Adicionando empresa:", newCompany);
    addContextCompany(newCompany);
    // Também atualizar localmente para resposta imediata
    setLocalCompanies((prev) => [...prev, newCompany]);
  };

  const fetchCompanies = async () => {
    try {
      console.log("🔄 Hook useCompanies: Buscando empresas da API");
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        console.log(
          "🔄 Hook useCompanies: Empresas recebidas da API:",
          data.length
        );
        setContextCompanies(data);
      } else {
        console.error(
          "🔄 Hook useCompanies: Erro na resposta da API:",
          response.status
        );
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    }
  };

  // Carregar empresas na inicialização
  useEffect(() => {
    console.log("🔄 Hook useCompanies: Carregando empresas na inicialização");
    fetchCompanies();
  }, []);

  // Recarregar empresas quando o contexto estiver vazio
  useEffect(() => {
    if (contextCompanies.length === 0 && localCompanies.length === 0) {
      console.log(
        "🔄 Hook useCompanies: Recarregando empresas (contexto vazio)"
      );
      fetchCompanies();
    }
  }, [contextCompanies.length, localCompanies.length]);

  return {
    companies,
    setCompanies: setContextCompanies,
    inactiveCompanies,
    inactiveCompaniesFilter,
    setInactiveCompaniesFilter,
    inactiveCompaniesPage,
    setInactiveCompaniesPage,
    inactiveCompaniesLoading,
    INACTIVE_COMPANIES_PAGE_SIZE,
    fetchCompanies,
    fetchInactiveCompanies,
    handleToggleCompanyStatus,
    handleDeleteCompany,
    handleReactivateCompany,
    updateCompany,
    removeCompany,
    addCompany,
  };
}
