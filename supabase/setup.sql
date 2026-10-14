-- SABEIME: cole tudo isto em Supabase > SQL Editor > New query > Run.
-- Antes, crie o usuário do dono em Authentication > Users (e-mail dono@sabeime.com).

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('mistura', 'acomp')),
  sold_out boolean not null default false,
  position int not null default 0
);
create table if not exists public.drinks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(8,2) not null default 0,
  sold_out boolean not null default false,
  position int not null default 0
);
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  prices jsonb not null default '{"pf":24,"eco":15,"p":22,"m":24,"g":26,"salada":8}',
  image_path text,
  image_version bigint
);

insert into public.settings (id) values (1) on conflict do nothing;
insert into public.menu_items (name, kind, position)
select * from (values ('Arroz','acomp',1), ('Feijão','acomp',2), ('Farofa','acomp',3), ('Macarrão','acomp',4)) v
where not exists (select 1 from public.menu_items);

-- Segurança: todos podem VER; só o dono (role "owner") pode ALTERAR.
do $$
declare t text;
begin
  foreach t in array array['menu_items', 'drinks', 'settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists "todos veem" on public.%I', t);
    execute format('create policy "todos veem" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "dono altera" on public.%I', t);
    execute format($p$create policy "dono altera" on public.%I for all to authenticated
      using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
      with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')$p$, t);
  end loop;
end $$;

-- Pasta da imagem do cardápio (pública para leitura; só o dono envia/troca/apaga)
insert into storage.buckets (id, name, public) values ('cardapio', 'cardapio', true)
on conflict (id) do update set public = true;
drop policy if exists "dono gerencia imagens" on storage.objects;
create policy "dono gerencia imagens" on storage.objects for all to authenticated
  using (bucket_id = 'cardapio' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
  with check (bucket_id = 'cardapio' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

-- Marca o usuário do dono (precisa já existir)
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"owner"}'::jsonb
where email = 'dono@sabeime.com';
