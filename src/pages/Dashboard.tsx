import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, Users, UserCheck, UserX, Plus } from "lucide-react";
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
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    a.telefone?.toLowerCase().includes(search.toLowerCase()) ||
    a.cpf?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssociados = associados?.length || 0;
  const totalSocios = associados?.filter(a => a.eh_socio_atual).length || 0;
  const totalNaoSocios = totalAssociados - totalSocios;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Associados</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Gerencie os associados cadastrados</p>
        </div>
        <Button
          onClick={() => navigate("/cadastro")}
          className="rounded-xl h-10 sm:h-11 px-3 sm:px-5 gradient-primary border-0 shadow-elevated font-bold text-sm gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo</span>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="shadow-card border-0 bg-card">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-extrabold text-foreground leading-none">{totalAssociados}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 bg-card">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-extrabold text-foreground leading-none">{totalSocios}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">Sócios</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 bg-card">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <UserX className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-extrabold text-foreground leading-none">{totalNaoSocios}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">Não sócios</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-card shadow-card border-0"
        />
      </div>

      {/* Table / Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="block sm:hidden space-y-2">
            {filtered?.map((a) => (
              <Card key={a.id} className="shadow-card border-0">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground truncate">{a.nome}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.telefone || "Sem telefone"}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          a.status === "Ativo"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : a.status === "Inativo"
                            ? "bg-red-500/10 text-red-700"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {a.status || "—"}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          a.eh_socio_atual
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {a.eh_socio_atual ? "Sócio" : "Não sócio"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/associado/${a.id}`)}
                        className="rounded-xl hover:bg-primary/10 hover:text-primary h-8 w-8"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      {user?.cargo === "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(a.id)}
                          className="rounded-xl hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered?.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Nenhum associado encontrado
              </div>
            )}
          </div>

          {/* Desktop table view */}
          <Card className="hidden sm:block shadow-card border-0 overflow-hidden">
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
