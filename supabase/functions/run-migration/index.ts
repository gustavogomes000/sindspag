import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const sqls = [
    `CREATE OR REPLACE FUNCTION public.sindspag_login(p_nome text, p_senha text)
    RETURNS json LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $fn$
    DECLARE v_user sindspag_usuarios;
    BEGIN
      SELECT * INTO v_user FROM sindspag_usuarios WHERE lower(nome) = lower(p_nome);
      IF v_user.id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Usuário não encontrado');
      END IF;
      IF v_user.senha_hash = crypt(p_senha, v_user.senha_hash) THEN
        RETURN json_build_object('success', true, 'user_id', v_user.id, 'nome', v_user.nome, 'cargo', v_user.cargo);
      ELSE
        RETURN json_build_object('success', false, 'message', 'Senha incorreta');
      END IF;
    END;
    $fn$;`,

    `CREATE OR REPLACE FUNCTION public.sindspag_deletar_usuario(p_user_id uuid)
    RETURNS json LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $fn$
    BEGIN
      DELETE FROM sindspag_usuarios WHERE id = p_user_id;
      IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Usuário não encontrado');
      END IF;
      RETURN json_build_object('success', true);
    END;
    $fn$;`,

    `CREATE OR REPLACE FUNCTION public.sindspag_atualizar_cargo(p_user_id uuid, p_cargo text)
    RETURNS json LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $fn$
    BEGIN
      UPDATE sindspag_usuarios SET cargo = p_cargo WHERE id = p_user_id;
      IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Usuário não encontrado');
      END IF;
      RETURN json_build_object('success', true);
    END;
    $fn$;`,

    `CREATE OR REPLACE FUNCTION public.sindspag_resetar_senha(p_user_id uuid, p_nova_senha text)
    RETURNS json LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $fn$
    BEGIN
      UPDATE sindspag_usuarios SET senha_hash = crypt(p_nova_senha, gen_salt('bf')) WHERE id = p_user_id;
      IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Usuário não encontrado');
      END IF;
      RETURN json_build_object('success', true);
    END;
    $fn$;`,
  ];

  const results = [];
  for (const sql of sqls) {
    const { error } = await supabase.rpc("exec_sql", { sql_text: sql }).maybeSingle();
    if (error) {
      // Try direct SQL via pg
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
      });
      results.push({ sql: sql.substring(0, 50), error: error.message });
    } else {
      results.push({ sql: sql.substring(0, 50), success: true });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
