"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shared/ui/dialog";
import { useToast } from "@/hooks/shared/use-toast";
import { useSession } from "next-auth/react";
import { Building2, User, Mail, Lock, Save, X } from "lucide-react";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

interface ProfileData {
  name: string;
  email: string;
  company: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export function ProfileEditModal({
  open,
  onClose,
  onProfileUpdated,
}: ProfileEditModalProps) {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    company: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  // Carregar dados do perfil quando o modal abrir
  useEffect(() => {
    if (open && session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
        company: (session.user as any)?.company || "",
        role: (session.user as any)?.role || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [open, session]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (
      profileData.password &&
      profileData.password !== profileData.confirmPassword
    ) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (profileData.password && profileData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          company: profileData.company,
          role: profileData.role,
          password: profileData.password || undefined, // Só envia se foi preenchida
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Forçar atualização da sessão com os novos dados
        await update({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          company: result.user.company,
          role: result.user.role,
        });

        toast({
          title: "Sucesso",
          description:
            "Perfil atualizado com sucesso! As alterações foram aplicadas.",
        });
        onClose();

        // Notificar que o perfil foi atualizado
        if (onProfileUpdated) {
          onProfileUpdated();
        }
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Erro ao atualizar perfil.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="w-5 h-5" />
            Editar Meu Perfil
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações da Empresa */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="w-4 h-4" />
              Informações da Empresa
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Nome
              </Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nome da empresa"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@empresa.com"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm">
                Nome da Empresa
              </Label>
              <Input
                id="company"
                value={profileData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Nome da empresa"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm">
                Cargo/Função
              </Label>
              <Input
                id="role"
                value={profileData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                placeholder="Ex: Administrador, Gerente, etc."
                required
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Alteração de Senha */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lock className="w-4 h-4" />
              Alterar Senha
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                Nova Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={profileData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Deixe em branco para manter a senha atual"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="Confirme a nova senha"
                className="h-10 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
