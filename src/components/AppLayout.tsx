import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, LogOut, PlusCircle, Settings } from "lucide-react";
import logo from "@/assets/sindspag-logo.png";

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
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SINDSPAG" className="h-10 object-contain" />
            <span className="font-bold text-foreground hidden sm:block">SINDSPAG</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-destructive">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="container mx-auto flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to === "/cadastro" && location.pathname.startsWith("/associado/"));
            return (
              <Link key={item.to} to={item.to} className="flex-1">
                <div className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                  <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  <span className="text-xs font-medium">{item.label}</span>
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
