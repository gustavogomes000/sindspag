import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, User, Vote, Star } from "lucide-react";

const SITUACOES_TITULO = ["Regular", "Cancelado", "Suspenso", "Não possui"];
const STATUS_OPTIONS = ["Ativo", "Inativo", "Suspenso"];
const COMPROMETIMENTO_OPTIONS = ["Alto", "Médio", "Baixo", "Indefinido"];
const UF_OPTIONS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

interface FormData {
  nome: string;
  cpf: string;
  telefone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  titulo_eleitor: string;
  zona_eleitoral: string;
  secao_eleitoral: string;
  municipio: string;
  uf: string;
  colegio_eleitoral: string;
  situacao_titulo: string;
  ligacao_politica: string;
  posicao_ligacao: string;
  regiao_atuacao: string;
  apoiadores: number;
  meta_votos: number;
  status: string;
  comprometimento: string;
  observacoes: string;
  eh_socio_atual: boolean;
  socio_desde: string;
  ja_foi_socio: boolean;
  foi_socio_quando: string;
}

const defaultForm: FormData = {
  nome: "", cpf: "", telefone: "", whatsapp: "", email: "", instagram: "", facebook: "",
  titulo_eleitor: "", zona_eleitoral: "", secao_eleitoral: "", municipio: "", uf: "GO",
  colegio_eleitoral: "", situacao_titulo: "", ligacao_politica: "", posicao_ligacao: "",
  regiao_atuacao: "", apoiadores: 0, meta_votos: 0, status: "Ativo", comprometimento: "",
  observacoes: "", eh_socio_atual: false, socio_desde: "", ja_foi_socio: false, foi_socio_quando: "",
};

const AssociadoForm = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      supabase.from("sindspag_associados").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          setForm({
            nome: data.nome || "",
            cpf: data.cpf || "",
            telefone: data.telefone || "",
            whatsapp: data.whatsapp || "",
            email: data.email || "",
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            titulo_eleitor: data.titulo_eleitor || "",
            zona_eleitoral: data.zona_eleitoral || "",
            secao_eleitoral: data.secao_eleitoral || "",
            municipio: data.municipio || "",
            uf: data.uf || "GO",
            colegio_eleitoral: data.colegio_eleitoral || "",
            situacao_titulo: data.situacao_titulo || "",
            ligacao_politica: data.ligacao_politica || "",
            posicao_ligacao: data.posicao_ligacao || "",
            regiao_atuacao: data.regiao_atuacao || "",
            apoiadores: data.apoiadores || 0,
            meta_votos: data.meta_votos || 0,
            status: data.status || "Ativo",
            comprometimento: data.comprometimento || "",
            observacoes: data.observacoes || "",
            eh_socio_atual: data.eh_socio_atual || false,
            socio_desde: data.socio_desde || "",
            ja_foi_socio: data.ja_foi_socio || false,
            foi_socio_quando: data.foi_socio_quando || "",
          });
        }
      });
    }
  }, [id, isNew]);

  const set = (key: keyof FormData, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    setLoading(true);

    const payload = {
      ...form,
      criado_por: isNew ? user?.id : undefined,
      socio_desde: form.eh_socio_atual && form.socio_desde ? form.socio_desde : null,
      ja_foi_socio: !form.eh_socio_atual ? form.ja_foi_socio : false,
      foi_socio_quando: !form.eh_socio_atual && form.ja_foi_socio ? form.foi_socio_quando : null,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("sindspag_associados").insert(payload));
    } else {
      ({ error } = await supabase.from("sindspag_associados").update(payload).eq("id", id));
    }

    setLoading(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success(isNew ? "Associado cadastrado!" : "Associado atualizado!");
      navigate("/associados");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {id && (
        <Button variant="ghost" onClick={() => navigate("/associados")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      )}

      <h1 className="text-2xl font-bold text-foreground">
        {isNew ? "Cadastrar Associado" : "Editar Associado"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* DADOS PESSOAIS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <User className="h-5 w-5" /> DADOS PESSOAIS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome completo *</Label>
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome do associado" required />
            </div>
            <div>
              <Label>CPF</Label>
              <Input value={form.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(00) 0000-0000" />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@exemplo.com" type="email" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Instagram</Label>
                <Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@usuario" />
              </div>
              <div>
                <Label>Facebook</Label>
                <Input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="Nome ou link" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DADOS SINDICAIS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              🏛️ VÍNCULO SINDICAL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>É sócio atualmente?</Label>
              <Select value={form.eh_socio_atual ? "sim" : "nao"} onValueChange={(v) => set("eh_socio_atual", v === "sim")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.eh_socio_atual && (
              <div>
                <Label>Sócio desde</Label>
                <Input type="date" value={form.socio_desde} onChange={(e) => set("socio_desde", e.target.value)} />
              </div>
            )}

            {!form.eh_socio_atual && (
              <>
                <div>
                  <Label>Já foi sócio?</Label>
                  <Select value={form.ja_foi_socio ? "sim" : "nao"} onValueChange={(v) => set("ja_foi_socio", v === "sim")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.ja_foi_socio && (
                  <div>
                    <Label>Quando foi sócio?</Label>
                    <Input value={form.foi_socio_quando} onChange={(e) => set("foi_socio_quando", e.target.value)} placeholder="Ex: 2018 a 2021" />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* DADOS ELEITORAIS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Vote className="h-5 w-5" /> DADOS ELEITORAIS
            </CardTitle>
            <a
              href="https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral#/atendimento-eleitor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              <ExternalLink className="h-4 w-4" /> Consultar dados no TSE
            </a>
            <p className="text-sm text-muted-foreground mt-1">
              Abra o site do TSE, consulte os dados eleitorais e preencha abaixo.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título de eleitor</Label>
              <Input value={form.titulo_eleitor} onChange={(e) => set("titulo_eleitor", e.target.value)} placeholder="Número do título" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Zona</Label>
                <Input value={form.zona_eleitoral} onChange={(e) => set("zona_eleitoral", e.target.value)} placeholder="045" />
              </div>
              <div>
                <Label>Seção</Label>
                <Input value={form.secao_eleitoral} onChange={(e) => set("secao_eleitoral", e.target.value)} placeholder="0123" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label>Município</Label>
                <Input value={form.municipio} onChange={(e) => set("municipio", e.target.value)} placeholder="Cidade" />
              </div>
              <div>
                <Label>UF</Label>
                <Select value={form.uf} onValueChange={(v) => set("uf", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UF_OPTIONS.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Colégio eleitoral</Label>
              <Input value={form.colegio_eleitoral} onChange={(e) => set("colegio_eleitoral", e.target.value)} placeholder="Nome da escola / local" />
            </div>
            <div>
              <Label>Situação do título</Label>
              <Select value={form.situacao_titulo || ""} onValueChange={(v) => set("situacao_titulo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {SITUACOES_TITULO.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* PERFIL E STATUS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Star className="h-5 w-5" /> PERFIL E STATUS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ligação política</Label>
              <Input value={form.ligacao_politica} onChange={(e) => set("ligacao_politica", e.target.value)} placeholder="A quem é ligado politicamente" />
            </div>
            <div>
              <Label>Posição da ligação</Label>
              <Input value={form.posicao_ligacao} onChange={(e) => set("posicao_ligacao", e.target.value)} placeholder="Cargo político ou função" />
            </div>
            <div>
              <Label>Região de atuação</Label>
              <Input value={form.regiao_atuacao} onChange={(e) => set("regiao_atuacao", e.target.value)} placeholder="Bairro X, Comunidade Y..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Apoiadores</Label>
                <Input type="number" value={form.apoiadores} onChange={(e) => set("apoiadores", Number(e.target.value))} />
              </div>
              <div>
                <Label>Meta votos</Label>
                <Input type="number" value={form.meta_votos} onChange={(e) => set("meta_votos", Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Status *</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Comprometimento</Label>
                <Select value={form.comprometimento || ""} onValueChange={(v) => set("comprometimento", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {COMPROMETIMENTO_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Anotações gerais..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/associados")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : isNew ? "Cadastrar" : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssociadoForm;
