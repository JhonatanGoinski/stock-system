"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Package, ShoppingCart, BarChart3, FileText } from "lucide-react"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Produtos", icon: Package },
    { id: "sales", label: "Vendas", icon: ShoppingCart },
    { id: "reports", label: "Relatórios", icon: FileText },
  ]

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex flex-col space-y-4 mt-6">
          <div className="flex items-center space-x-2 px-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Sistema de Estoque</span>
          </div>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className="justify-start h-12"
                  onClick={() => handleTabChange(item.id)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
