"use client"

import { Package } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"

interface MobileHeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileHeader({ activeTab, onTabChange }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary rounded-md md:p-2">
              <Package className="h-4 w-4 text-primary-foreground md:h-5 md:w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground md:text-xl">Sistema de Estoque</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Gestão Empresarial</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">Minha Empresa</p>
            <p className="text-xs text-muted-foreground">Versão Mobile</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
