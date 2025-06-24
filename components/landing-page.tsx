"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import {
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Smartphone,
  Globe,
} from "lucide-react";

export function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: Package,
      title: "Gestão de Produtos",
      description:
        "Controle completo do seu inventário com alertas de estoque baixo",
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Cadastre e gerencie seus clientes com histórico completo",
    },
    {
      icon: ShoppingCart,
      title: "Controle de Vendas",
      description: "Registre vendas e acompanhe o fluxo de caixa em tempo real",
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Dashboards interativos com métricas de performance",
    },
    {
      icon: TrendingUp,
      title: "Análise de Performance",
      description: "Acompanhe tendências e tome decisões baseadas em dados",
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados protegidos com autenticação segura",
    },
  ];

  const benefits = [
    "Interface moderna e intuitiva",
    "Acesso via desktop e mobile",
    "Relatórios em tempo real",
    "Backup automático dos dados",
    "Suporte 24/7",
    "Atualizações gratuitas",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">StockMaster</h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Estoque
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </Button>
            <Button asChild className="px-4 py-2 text-base md:text-base">
              <a href="/login" className="flex items-center gap-2">
                <span className="hidden sm:inline">Entrar no Sistema</span>
                <span className="inline sm:hidden">
                  <ArrowRight className="h-5 w-5" />
                </span>
                <span className="hidden sm:inline">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            <Zap className="mr-2 h-4 w-4" />
            Sistema Completo de Gestão
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Controle Total do Seu
            <br />
            <span className="text-foreground">Estoque</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerencie produtos, clientes e vendas com uma interface moderna e
            intuitiva. Tome decisões baseadas em dados reais e impulsione seu
            negócio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 flex items-center gap-2 justify-center whitespace-nowrap"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <a
                href="/login"
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span>Começar Agora</span>
                <ArrowRight
                  className={`h-5 w-5 transition-transform ${
                    isHovered ? "translate-x-1" : ""
                  }`}
                />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <a href="#features">Ver Funcionalidades</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Sistema Online</p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Disponibilidade</p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Produtos Gerenciados</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Funcionalidades Principais
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar seu estoque de forma eficiente
            e profissional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Por que escolher o StockMaster?
            </h2>
            <p className="text-xl text-muted-foreground">
              Benefícios exclusivos que fazem a diferença no seu dia a dia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {benefits.slice(3).map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto text-center p-12 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-0">
            <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a centenas de empresas que já confiam no StockMaster para
              gerenciar seus estoques
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 flex items-center gap-2 justify-center whitespace-nowrap"
            >
              <a
                href="/login"
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span>Acessar Sistema</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">StockMaster</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema de Estoque
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2024 StockMaster. Todos os direitos reservados.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
