import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, LogOut, PlusCircle, Settings } from "lucide-react";


const AppLayout = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!user) return <Navigate to="/" replace />;

  const navItems = [
    { to: "/cadastro", label: "Cadastrar", icon: PlusCircle },
    { to: "/associados", label: "Associados", icon: Users },
    ...(user.cargo === "admin" ? [{ to: "/usuarios", label: "Usuários", icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header with gradient */}
      <header className="gradient-primary shadow-elevated">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <span className="font-extrabold text-white text-xl tracking-tight">SINDSPAG</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm hidden sm:block">
              Olá, <span className="text-white font-semibold">{user.nome}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 sm:p-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t shadow-[0_-2px_20px_rgba(0,0,0,0.06)] z-50">
        <div className="container mx-auto flex items-center justify-around h-[4.25rem] px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to === "/cadastro" && location.pathname.startsWith("/associado/"));
            return (
              <Link key={item.to} to={item.to} className="flex-1">
                <div className={`flex flex-col items-center gap-1 py-2 transition-all duration-200 ${
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                    <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  </div>
                  <span className={`text-[11px] ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
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
