"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Badge } from "@/components/shared/ui/badge";
import { Separator } from "@/components/shared/ui/separator";
import { Building2, Mail, Phone, MapPin, FileText, Eye } from "lucide-react";

interface Company {
  id: number;
  name: string;
  description?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

interface CompanyViewModalProps {
  company: Company | null;
  open: boolean;
  onClose: () => void;
}

export function CompanyViewModal({
  company,
  open,
  onClose,
}: CompanyViewModalProps) {
  if (!company) return null;

  const formatField = (value: string | null | undefined) => {
    if (!value || value.trim() === "") {
      return (
        <span className="text-muted-foreground italic">Não preenchido</span>
      );
    }
    return value;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informações da Empresa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome e Status */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={company.isActive ? "default" : "secondary"}>
                {company.isActive ? "Ativa" : "Inativa"}
              </Badge>
              {company._count && (
                <Badge variant="outline">
                  {company._count.products} produtos
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Descrição */}
          {company.description && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Descrição
              </h4>
              <p className="text-sm">{company.description}</p>
            </div>
          )}

          {/* Informações de Contato */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Informações de Contato
            </h4>

            <div className="space-y-2">
              {/* CNPJ */}
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">CNPJ:</span>
                <span className="text-sm">{formatField(company.cnpj)}</span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{formatField(company.email)}</span>
              </div>

              {/* Telefone */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Telefone:</span>
                <span className="text-sm">{formatField(company.phone)}</span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Endereço
            </h4>

            <div className="space-y-2">
              {/* Endereço */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <span className="font-medium">Endereço:</span>
                  <br />
                  <span>{formatField(company.address)}</span>
                </div>
              </div>

              {/* Cidade/Estado/CEP */}
              <div className="flex items-center gap-2 ml-6">
                <span className="text-sm">
                  {formatField(company.city)}
                  {company.city && company.state && ", "}
                  {formatField(company.state)}
                  {company.zipCode && " - "}
                  {formatField(company.zipCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Informações do Sistema
            </h4>
            <div className="text-xs text-muted-foreground">
              ID: {company.id}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
