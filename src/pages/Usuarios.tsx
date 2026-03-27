import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { UserPlus, Shield } from "lucide-react";

const Usuarios = () => {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: usuarios, refetch } = useQuery({
    queryKey: ["sindspag_usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sindspag_usuarios").select("id, nome, cargo, criado_em").order("criado_em");
      if (error) throw error;
      return data;
    },
  });

  if (user?.cargo !== "admin") return <Navigate to="/dashboard" replace />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !senha.trim()) { toast.error("Preencha nome e senha"); return; }
    setLoading(true);
    const { data, error } = await supabase.rpc("sindspag_criar_usuario", { p_nome: nome, p_senha: senha });
    setLoading(false);
    const result = data as any;
    if (error || !result?.success) {
      toast.error(result?.message || "Erro ao criar usuário");
    } else {
      toast.success("Usuário criado!");
      setNome("");
      setSenha("");
      refetch();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
      </div>

      <Card className="shadow-card border-0 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Criar Novo Usuário</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do usuário" required className="h-11 rounded-xl border-0 bg-muted/50 focus:bg-background" />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</Label>
              <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" required className="h-11 rounded-xl border-0 bg-muted/50 focus:bg-background" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="rounded-xl h-11 px-6 gradient-primary border-0 shadow-elevated font-bold">
                {loading ? "Criando..." : "Criar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card border-0 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Usuários Cadastrados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-bold text-foreground">Nome</TableHead>
                <TableHead className="font-bold text-foreground">Cargo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios?.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">{u.nome}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      u.cargo === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {u.cargo}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Usuarios;
