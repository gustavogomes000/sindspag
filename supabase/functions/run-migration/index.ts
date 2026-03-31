import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

Deno.serve(async () => {
  const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;
  const sql = postgres(dbUrl);

  try {
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.sindspag_login(p_nome text, p_senha text)
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
      $fn$;
    `);

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.sindspag_deletar_usuario(p_user_id uuid)
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
      $fn$;
    `);

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.sindspag_atualizar_cargo(p_user_id uuid, p_cargo text)
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
      $fn$;
    `);

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.sindspag_resetar_senha(p_user_id uuid, p_nova_senha text)
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
      $fn$;
    `);

    await sql.end();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    await sql.end();
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
