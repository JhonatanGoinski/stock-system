"use client"

import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, BarChart3, FileText, Users } from "lucide-react"

interface MobileTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileTabs({ activeTab, onTabChange }: MobileTabsProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Produtos", icon: Package },
    { id: "customers", label: "Clientes", icon: Users },
    { id: "sales", label: "Vendas", icon: ShoppingCart },
    { id: "reports", label: "Relatórios", icon: FileText },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              size="sm"
              className="flex flex-col h-16 p-2"
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
