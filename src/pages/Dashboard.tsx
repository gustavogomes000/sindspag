import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, Users, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: associados, isLoading, refetch } = useQuery({
    queryKey: ["sindspag_associados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sindspag_associados")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir?")) return;
    const { error } = await supabase.from("sindspag_associados").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
    } else {
      toast.success("Excluído com sucesso");
      refetch();
    }
  };

  const filtered = associados?.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssociados = associados?.length || 0;
  const totalSocios = associados?.filter(a => a.eh_socio_atual).length || 0;
  const totalNaoSocios = totalAssociados - totalSocios;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Associados</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie todos os associados cadastrados</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-card border-0 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground leading-none">{totalAssociados}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground leading-none">{totalSocios}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Sócios</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <UserX className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground leading-none">{totalNaoSocios}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Não sócios</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-card shadow-card border-0"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <Card className="shadow-card border-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-bold text-foreground">Nome</TableHead>
                <TableHead className="font-bold text-foreground">Telefone</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="font-bold text-foreground">Sócio</TableHead>
                <TableHead className="w-24 font-bold text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((a) => (
                <TableRow key={a.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">{a.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{a.telefone || "—"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      a.status === "Ativo"
                        ? "bg-emerald-500/10 text-emerald-700"
                        : a.status === "Inativo"
                        ? "bg-red-500/10 text-red-700"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {a.status || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      a.eh_socio_atual
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {a.eh_socio_atual ? "Sim" : "Não"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/associado/${a.id}`)}
                        className="rounded-xl hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user?.cargo === "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(a.id)}
                          className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Nenhum associado encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
