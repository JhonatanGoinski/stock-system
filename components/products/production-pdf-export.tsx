"use client";

import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/shared/use-toast";

interface ProductionPDFExportProps {
  productId: number;
  productName: string;
  disabled?: boolean;
}

interface ExportData {
  product: {
    id: number;
    name: string;
    category: string;
    size: string | null;
    costPrice: number;
    salePrice: number;
    stockQuantity: number;
  };
  company: {
    id: number;
    name: string;
    cnpj: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
  } | null;
  productionHistory: Array<{
    id: number;
    quantity: number;
    productionDate: string;
    notes: string | null;
    createdAt: string;
  }>;
  totals: {
    totalProduced: number;
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
  };
  exportDate: string;
}

export function ProductionPDFExport({
  productId,
  productName,
  disabled = false,
}: ProductionPDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const generatePDF = async () => {
    try {
      setIsExporting(true);

      // Buscar dados para exportação
      const response = await fetch(
        `/api/products/${productId}/export-production`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar dados para exportação");
      }

      const data: ExportData = await response.json();

      // Criar conteúdo do PDF
      const pdfContent = createPDFContent(data);

      // Gerar PDF usando jsPDF
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Configurar fonte para suportar caracteres especiais
      doc.setFont("helvetica");

      // Adicionar conteúdo ao PDF
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Cabeçalho da empresa
      if (data.company) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(data.company.name, margin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const companyInfo = [];
        if (data.company.cnpj) companyInfo.push(`CNPJ: ${data.company.cnpj}`);
        if (data.company.email)
          companyInfo.push(`Email: ${data.company.email}`);
        if (data.company.phone)
          companyInfo.push(`Telefone: ${data.company.phone}`);
        if (data.company.address)
          companyInfo.push(`Endereço: ${data.company.address}`);
        if (data.company.city && data.company.state) {
          companyInfo.push(`${data.company.city}/${data.company.state}`);
        }
        if (data.company.zipCode)
          companyInfo.push(`CEP: ${data.company.zipCode}`);

        companyInfo.forEach((info) => {
          doc.text(info, margin, yPosition);
          yPosition += 5;
        });
      }

      yPosition += 10;

      // Informações do produto
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Produto: ${data.product.name}`, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Categoria: ${data.product.category}`, margin, yPosition);
      yPosition += 5;

      if (data.product.size) {
        doc.text(`Tamanho: ${data.product.size}`, margin, yPosition);
        yPosition += 5;
      }

      doc.text(
        `Quantidade Produzida: ${data.totals.totalProduced} unidades`,
        margin,
        yPosition
      );
      yPosition += 5;

      doc.text(
        `Custo Unitário: ${formatCurrency(data.product.costPrice)}`,
        margin,
        yPosition
      );
      yPosition += 5;

      doc.text(
        `Preço de Venda: ${formatCurrency(data.product.salePrice)}`,
        margin,
        yPosition
      );
      yPosition += 5;

      const profitPercentage =
        ((data.product.salePrice - data.product.costPrice) /
          data.product.costPrice) *
        100;
      doc.text(
        `Lucro Unitário: ${profitPercentage.toFixed(1)}%`,
        margin,
        yPosition
      );
      yPosition += 10;

      // Histórico de produção
      if (data.productionHistory.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Histórico de Produção:", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        data.productionHistory.forEach((record) => {
          // Verificar se precisa de nova página
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          doc.text(
            `Data: ${record.productionDate} - Quantidade: ${record.quantity} unidades`,
            margin,
            yPosition
          );
          yPosition += 5;

          if (record.notes) {
            doc.text(`Notas: ${record.notes}`, margin + 10, yPosition);
            yPosition += 5;
          }

          yPosition += 3;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Não existem notas de produção registradas.",
          margin,
          yPosition
        );
        yPosition += 10;
      }

      yPosition += 10;

      // Totais
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Total:", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Produzido: ${data.totals.totalProduced} unidades`,
        margin,
        yPosition
      );
      yPosition += 5;
      doc.text(
        `Custo Total: ${formatCurrency(data.totals.totalCost)}`,
        margin,
        yPosition
      );
      yPosition += 5;
      doc.text(
        `Receita Total: ${formatCurrency(data.totals.totalRevenue)}`,
        margin,
        yPosition
      );
      yPosition += 5;
      doc.text(
        `Lucro Total: ${formatCurrency(data.totals.totalProfit)}`,
        margin,
        yPosition
      );

      // Data de exportação
      yPosition += 10;
      doc.setFontSize(8);
      doc.text(`Exportado em: ${data.exportDate}`, margin, yPosition);

      // Salvar PDF
      const fileName = `Producao_${data.product.name.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${data.exportDate.replace(/\//g, "-")}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Exportado",
        description: `Histórico de produção de "${data.product.name}" exportado com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar o histórico de produção.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const createPDFContent = (data: ExportData) => {
    // Esta função pode ser expandida se necessário
    return data;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePDF}
      disabled={disabled || isExporting}
      className="flex items-center gap-2"
      title="Exportar histórico em PDF"
    >
      {isExporting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <FileText className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">PDF</span>
    </Button>
  );
}
