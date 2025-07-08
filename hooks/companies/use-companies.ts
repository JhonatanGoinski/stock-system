import { useState, useEffect } from "react";
import { useToast } from "@/hooks/shared/use-toast";

export function useCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [inactiveCompanies, setInactiveCompanies] = useState<any[]>([]);
  const [inactiveCompaniesFilter, setInactiveCompaniesFilter] = useState("");
  const [inactiveCompaniesPage, setInactiveCompaniesPage] = useState(1);
  const [inactiveCompaniesLoading, setInactiveCompaniesLoading] =
    useState(false);
  const INACTIVE_COMPANIES_PAGE_SIZE = 5;
  const { toast } = useToast();
  // Removido triggerSoftRefresh para evitar loops

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

  const updateCompany = (updatedCompany: any) => {
    console.log("🔄 Atualizando empresa no hook:", updatedCompany);
    setCompanies((prev) => {
      const newCompanies = prev.map((company) =>
        company.id === updatedCompany.id ? updatedCompany : company
      );
      console.log("🔄 Empresas atualizadas:", newCompanies.length);
      return newCompanies;
    });
  };

  const removeCompany = (companyId: number) => {
    console.log("🔄 Removendo empresa no hook:", companyId);
    setCompanies((prev) => {
      const newCompanies = prev.filter((company) => company.id !== companyId);
      console.log("🔄 Empresas após remoção:", newCompanies.length);
      return newCompanies;
    });
  };

  const addCompany = (newCompany: any) => {
    setCompanies((prev) => [...prev, newCompany]);
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    }
  };

  // Carregar empresas na inicialização
  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    setCompanies,
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
