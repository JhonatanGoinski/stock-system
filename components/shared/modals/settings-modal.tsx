"use client";

import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Switch } from "@/components/shared/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shared/ui/dialog";
import { useToast } from "@/hooks/shared/use-toast";
import {
  Settings,
  Bell,
  Eye,
  Shield,
  Database,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

interface SettingsData {
  // Notificações
  lowStockAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;

  // Interface
  autoRefresh: boolean;
  showStockWarnings: boolean;
  compactView: boolean;

  // Segurança
  sessionTimeout: number;
  requirePasswordChange: boolean;

  // Sistema
  backupFrequency: string;
  dataRetention: string;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    lowStockAlerts: true,
    emailNotifications: false,
    pushNotifications: true,
    autoRefresh: true,
    showStockWarnings: true,
    compactView: false,
    sessionTimeout: 30,
    requirePasswordChange: false,
    backupFrequency: "daily",
    dataRetention: "1year",
  });

  const handleSettingChange = (key: keyof SettingsData, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simular salvamento das configurações
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings className="w-5 h-5" />
            Configurações do Sistema
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notificações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Bell className="w-5 h-5" />
              Notificações
            </div>

            <div className="space-y-4 pl-2 sm:pl-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">
                    Alertas de Estoque Baixo
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receber notificações quando produtos estiverem com estoque
                    baixo
                  </p>
                </div>
                <Switch
                  checked={settings.lowStockAlerts}
                  onCheckedChange={(checked) =>
                    handleSettingChange("lowStockAlerts", checked)
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">
                    Notificações por Email
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enviar relatórios e alertas por email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("emailNotifications", checked)
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">
                    Notificações Push
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar notificações no navegador
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("pushNotifications", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Interface */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Eye className="w-5 h-5" />
              Interface
            </div>

            <div className="space-y-4 pl-2 sm:pl-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">
                    Atualização Automática
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Atualizar dados automaticamente a cada 10 segundos
                  </p>
                </div>
                <Switch
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) =>
                    handleSettingChange("autoRefresh", checked)
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">
                    Avisos de Estoque
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar avisos visuais para produtos com estoque baixo
                  </p>
                </div>
                <Switch
                  checked={settings.showStockWarnings}
                  onCheckedChange={(checked) =>
                    handleSettingChange("showStockWarnings", checked)
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">
                    Visualização Compacta
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar mais informações em menos espaço
                  </p>
                </div>
                <Switch
                  checked={settings.compactView}
                  onCheckedChange={(checked) =>
                    handleSettingChange("compactView", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Shield className="w-5 h-5" />
              Segurança
            </div>

            <div className="space-y-4 pl-2 sm:pl-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tempo de Sessão (minutos)
                </Label>
                <Input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleSettingChange(
                      "sessionTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full sm:w-32 h-10 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Tempo máximo de inatividade antes do logout automático
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">
                    Alteração Obrigatória de Senha
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Forçar alteração de senha a cada 90 dias
                  </p>
                </div>
                <Switch
                  checked={settings.requirePasswordChange}
                  onCheckedChange={(checked) =>
                    handleSettingChange("requirePasswordChange", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Sistema */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Database className="w-5 h-5" />
              Sistema
            </div>

            <div className="space-y-4 pl-2 sm:pl-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Frequência de Backup
                </Label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) =>
                    handleSettingChange("backupFrequency", e.target.value)
                  }
                  className="w-full p-2 border rounded-md text-sm h-10"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Retenção de Dados</Label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) =>
                    handleSettingChange("dataRetention", e.target.value)
                  }
                  className="w-full p-2 border rounded-md text-sm h-10"
                >
                  <option value="6months">6 meses</option>
                  <option value="1year">1 ano</option>
                  <option value="2years">2 anos</option>
                  <option value="indefinite">Indefinido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Info className="w-5 h-5" />
              Status do Sistema
            </div>

            <div className="grid grid-cols-1 gap-3 pl-2 sm:pl-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Sistema Online</p>
                  <p className="text-xs text-muted-foreground">
                    Todas as funcionalidades disponíveis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Database className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Banco de Dados</p>
                  <p className="text-xs text-muted-foreground">
                    Conexão estável
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Último Backup</p>
                  <p className="text-xs text-muted-foreground">Há 2 horas</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <Settings className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Versão</p>
                  <p className="text-xs text-muted-foreground">v1.0.0</p>
                </div>
              </div>
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
              Salvar Configurações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
