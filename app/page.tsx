"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AuthGuard } from "@/components/shared/auth/auth-guard";
import { LandingPage } from "@/components/shared/landing-page";
import { Header } from "@/components/shared/layout/header";
import { MobileHeader } from "@/components/shared/mobile-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardProvider } from "@/hooks/dashboard/use-dashboard-context";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Se não estiver logado, mostrar a landing page
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LandingPage />;
  }

  // Se estiver logado, mostrar o dashboard protegido
  return (
    <AuthGuard>
      <DashboardProvider>
        <div className="min-h-screen bg-background md:mt-16">
          {/* Desktop Header */}
          <div className="hidden md:block">
            <Header />
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            <MobileHeader activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <DashboardContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </DashboardProvider>
    </AuthGuard>
  );
}
