import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, LogOut, PlusCircle, Settings } from "lucide-react";
import SplashScreen from "./SplashScreen";
import InstallPrompt from "./InstallPrompt";

const AppLayout = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <SplashScreen />;
  if (!user) return <Navigate to="/" replace />;

  const navItems = [
    { to: "/cadastro", label: "Cadastrar", icon: PlusCircle },
    { to: "/associados", label: "Associados", icon: Users },
    ...(user.cargo === "admin" ? [{ to: "/usuarios", label: "Usuários", icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header */}
      <header className="gradient-primary shadow-elevated sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">
          <span className="font-extrabold text-white text-lg sm:text-xl tracking-tight">SINDSPAG</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-white/70 text-xs sm:text-sm hidden xs:block">
              <span className="text-white font-semibold">{user.nome}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-xl h-8 sm:h-9 px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-3 sm:p-4 md:p-6 pb-20 sm:pb-24">
        <Outlet />
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t shadow-[0_-2px_20px_rgba(0,0,0,0.06)] z-50 safe-area-bottom">
        <div className="container mx-auto flex items-center justify-around h-16 sm:h-[4.25rem] px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to === "/cadastro" && location.pathname.startsWith("/associado/"));
            return (
              <Link key={item.to} to={item.to} className="flex-1">
                <div className={`flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 transition-all duration-200 ${
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                  <div className={`p-1 sm:p-1.5 rounded-xl transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                    <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  </div>
                  <span className={`text-[10px] sm:text-[11px] ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
