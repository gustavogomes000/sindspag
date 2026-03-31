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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, Shield, Trash2, KeyRound, Edit } from "lucide-react";

const CARGO_OPTIONS = ["admin", "usuario"];

const Usuarios = () => {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("usuario");
  const [loading, setLoading] = useState(false);

  // Edit dialog
  const [editUser, setEditUser] = useState<{ id: string; nome: string; cargo: string } | null>(null);
  const [editCargo, setEditCargo] = useState("");

  // Reset password dialog
  const [resetUser, setResetUser] = useState<{ id: string; nome: string } | null>(null);
  const [novaSenha, setNovaSenha] = useState("");

  const { data: usuarios, refetch } = useQuery({
    queryKey: ["sindspag_usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sindspag_usuarios")
        .select("id, nome, cargo, criado_em")
        .order("criado_em");
      if (error) throw error;
      return data;
    },
  });

  if (user?.cargo !== "admin") return <Navigate to="/associados" replace />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !senha.trim()) {
      toast.error("Preencha nome e senha");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("sindspag_criar_usuario", {
      p_nome: nome.trim(),
      p_senha: senha,
      p_cargo: cargo,
    });
    setLoading(false);
    const result = data as any;
    if (error || !result?.success) {
      toast.error(result?.message || "Erro ao criar usuário");
    } else {
      toast.success("Usuário criado!");
      setNome("");
      setSenha("");
      setCargo("usuario");
      refetch();
    }
  };

  const handleDelete = async (id: string, nomeUsuario: string) => {
    if (id === user?.id) {
      toast.error("Você não pode excluir seu próprio usuário");
      return;
    }
    if (!confirm(`Deseja realmente excluir o usuário "${nomeUsuario}"?`)) return;
    const { data, error } = await supabase.rpc("sindspag_deletar_usuario", { p_user_id: id });
    const result = data as any;
    if (error || !result?.success) {
      toast.error("Erro ao excluir usuário");
    } else {
      toast.success("Usuário excluído!");
      refetch();
    }
  };

  const handleEditCargo = async () => {
    if (!editUser) return;
    const { data, error } = await supabase.rpc("sindspag_atualizar_cargo", {
      p_user_id: editUser.id,
      p_cargo: editCargo,
    });
    const result = data as any;
    if (error || !result?.success) {
      toast.error("Erro ao atualizar cargo");
    } else {
      toast.success("Cargo atualizado!");
      setEditUser(null);
      refetch();
    }
  };

  const handleResetSenha = async () => {
    if (!resetUser || !novaSenha.trim()) {
      toast.error("Digite a nova senha");
      return;
    }
    const { data, error } = await supabase.rpc("sindspag_resetar_senha", {
      p_user_id: resetUser.id,
      p_nova_senha: novaSenha,
    });
    const result = data as any;
    if (error || !result?.success) {
      toast.error("Erro ao resetar senha");
    } else {
      toast.success("Senha resetada!");
      setResetUser(null);
      setNovaSenha("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
      </div>

      {/* Create user */}
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
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do usuário"
                  required
                  className="h-11 rounded-xl border-0 bg-muted/50 focus:bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</Label>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha"
                  required
                  className="h-11 rounded-xl border-0 bg-muted/50 focus:bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cargo</Label>
                <Select value={cargo} onValueChange={setCargo}>
                  <SelectTrigger className="h-11 rounded-xl border-0 bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGO_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="rounded-xl h-11 px-6 gradient-primary border-0 shadow-elevated font-bold">
                {loading ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* User list */}
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
                <TableHead className="w-32 font-bold text-foreground">Ações</TableHead>
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
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditUser(u); setEditCargo(u.cargo); }}
                        className="rounded-xl hover:bg-primary/10 hover:text-primary h-8 w-8"
                        title="Editar cargo"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setResetUser(u); setNovaSenha(""); }}
                        className="rounded-xl hover:bg-amber-500/10 hover:text-amber-600 h-8 w-8"
                        title="Resetar senha"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(u.id, u.nome)}
                        disabled={u.id === user?.id}
                        className="rounded-xl hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        title="Excluir usuário"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!usuarios || usuarios.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhum usuário cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit cargo dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cargo — {editUser?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cargo</Label>
            <Select value={editCargo} onValueChange={setEditCargo}>
              <SelectTrigger className="h-11 rounded-xl border-0 bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CARGO_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleEditCargo} className="rounded-xl gradient-primary border-0 font-bold">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog open={!!resetUser} onOpenChange={(open) => !open && setResetUser(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Resetar Senha — {resetUser?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nova Senha</Label>
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite a nova senha"
              className="h-11 rounded-xl border-0 bg-muted/50 focus:bg-background"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUser(null)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleResetSenha} className="rounded-xl gradient-primary border-0 font-bold">Resetar Senha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Usuarios;
