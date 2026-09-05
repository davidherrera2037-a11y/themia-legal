-- ============================================================
-- THEMIA LEGAL — Fase 5: endurecimiento de la base
-- Cópialo completo y pégalo en Supabase → SQL Editor → New query → Run
-- ============================================================
--
-- Esta migración no agrega pantallas: cierra agujeros que ya existían.
-- Lo más grave es el punto 1.


-- ------------------------------------------------------------
-- 1) NADIE PUEDE ASCENDERSE A SÍ MISMO
-- ------------------------------------------------------------
-- La política "profiles_update_own" deja que cada quien actualice su
-- propio perfil, y la columna `role` vive en ese mismo perfil. Es decir:
-- hasta ahora, una clienta con cuenta podía hacer una sola llamada a la
-- API y quedar como SUPER_ADMIN. Ninguna otra política lo impedía, porque
-- todas las demás preguntan "¿cuál es tu rol?" — y el rol ya sería el
-- nuevo.
--
-- No basta con quitar el campo del formulario: la API de Supabase está
-- abierta al navegador por diseño, así que el freno tiene que estar en la
-- base. Un trigger es el único punto por el que pasan todas las
-- actualizaciones, vengan de donde vengan.
create or replace function public.proteger_rol_y_estado()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  quien_edita text;
begin
  -- auth.uid() es null cuando el cambio viene de la consola SQL o de la
  -- clave de servicio. Ese caso sí puede tocar el rol: es la forma
  -- legítima de nombrar a la primera SUPER_ADMIN.
  if auth.uid() is null then
    return new;
  end if;

  select role into quien_edita from public.profiles where id = auth.uid();

  -- Una SUPER_ADMIN puede cambiar roles y estados de otras personas, pero
  -- no degradarse ni desactivarse a sí misma: eso deja la firma sin nadie
  -- que pueda administrar.
  if quien_edita = 'SUPER_ADMIN' and auth.uid() <> new.id then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'No puedes cambiar tu propio rol.'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    raise exception 'No puedes cambiar tu propio estado.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_rol_y_estado on public.profiles;
create trigger proteger_rol_y_estado
  before update on public.profiles
  for each row execute function public.proteger_rol_y_estado();

-- Para que la SUPER_ADMIN pueda administrar al equipo desde el portal
-- (antes solo se podía desde el Table Editor de Supabase).
drop policy if exists "profiles_update_super_admin" on public.profiles;
create policy "profiles_update_super_admin"
  on public.profiles for update
  using (public.get_my_role() = 'SUPER_ADMIN');


-- ------------------------------------------------------------
-- 2) EL EQUIPO TIENE QUE PODER VERSE ENTRE SÍ
-- ------------------------------------------------------------
-- Una ABOGADA solo podía ver su propio perfil, así que el desplegable
-- "abogada responsable" al crear un caso le salía con una sola opción:
-- ella misma. No es un riesgo, es un caso que no funcionaba.
--
-- Se abre solo entre el equipo interno: los perfiles de las clientas
-- siguen fuera de su alcance por esta vía.
drop policy if exists "profiles_select_equipo" on public.profiles;
create policy "profiles_select_equipo"
  on public.profiles for select
  using (
    public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA')
    and role in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA')
  );


-- ------------------------------------------------------------
-- 3) LAS FUNCIONES INTERNAS NO SON ENDPOINTS PÚBLICOS
-- ------------------------------------------------------------
-- Supabase publica toda función de public en /rest/v1/rpc/<nombre>. Las
-- de trigger no necesitan que nadie tenga EXECUTE (Postgres no lo
-- comprueba al dispararlas), así que quitarlo no rompe nada y cierra
-- puertas que no deberían existir.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.proteger_rol_y_estado() from public, anon, authenticated;

-- Lo mismo para el seguro que ya traía el proyecto: `rls_auto_enable` es
-- la función del event trigger `ensure_rls`, que activa RLS sola en cada
-- tabla nueva. Estaba abierta en /rest/v1/rpc/ incluso sin sesión. Un
-- event trigger tampoco comprueba EXECUTE al dispararse, así que el
-- seguro sigue funcionando igual. (Si tu proyecto no la tiene, este
-- bloque no hace nada.)
do $$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

-- get_my_role sí la evalúan las políticas RLS con los permisos de quien
-- consulta, así que "authenticated" la conserva. A "anon" se le quita:
-- sin sesión siempre devuelve nulo, no pierde nada.
revoke execute on function public.get_my_role() from public, anon;


-- ------------------------------------------------------------
-- 4) updated_at DEJA DE SER DECORATIVO
-- ------------------------------------------------------------
-- Las tres tablas tienen la columna y ninguna la actualizaba: se quedaba
-- para siempre con la fecha de creación. Sin esto no hay forma de saber
-- cuándo se tocó un caso por última vez.
create or replace function public.tocar_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.tocar_updated_at() from public, anon, authenticated;

drop trigger if exists tocar_updated_at on public.profiles;
create trigger tocar_updated_at before update on public.profiles
  for each row execute function public.tocar_updated_at();

drop trigger if exists tocar_updated_at on public.clients;
create trigger tocar_updated_at before update on public.clients
  for each row execute function public.tocar_updated_at();

drop trigger if exists tocar_updated_at on public.cases;
create trigger tocar_updated_at before update on public.cases
  for each row execute function public.tocar_updated_at();


-- ------------------------------------------------------------
-- 5) BITÁCORA DE CAMBIOS DE ROL
-- ------------------------------------------------------------
-- El rol decide quién ve los expedientes de todas las clientas. Hasta
-- ahora se podía cambiar sin dejar rastro: la fila mostraba el estado
-- final, no quién lo puso ni cuándo. En un despacho de abogadas eso sobra
-- explicar por qué es un problema.
create table if not exists public.profile_audit (
  id bigint generated always as identity primary key,
  profile_id uuid not null references auth.users (id) on delete cascade,
  profile_email text,
  role_anterior text,
  role_nuevo text,
  status_anterior text,
  status_nuevo text,
  -- Puede quedar nulo cuando el cambio viene de la consola SQL, que es
  -- justamente el caso que más interesa poder distinguir.
  cambiado_por uuid references auth.users (id) on delete set null,
  cambiado_en timestamptz not null default now()
);

comment on table public.profile_audit is
  'Historial de cambios de rol y de estado. Solo lectura para SUPER_ADMIN; nadie la edita.';

create index if not exists profile_audit_profile_idx
  on public.profile_audit (profile_id, cambiado_en desc);

create index if not exists profile_audit_autor_idx
  on public.profile_audit (cambiado_por);

create or replace function public.registrar_cambio_de_rol()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role
     or new.status is distinct from old.status then
    insert into public.profile_audit (
      profile_id, profile_email,
      role_anterior, role_nuevo,
      status_anterior, status_nuevo,
      cambiado_por
    ) values (
      new.id, new.email,
      old.role, new.role,
      old.status, new.status,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.registrar_cambio_de_rol() from public, anon, authenticated;

drop trigger if exists registrar_cambio_de_rol on public.profiles;
create trigger registrar_cambio_de_rol
  after update on public.profiles
  for each row execute function public.registrar_cambio_de_rol();

alter table public.profile_audit enable row level security;

drop policy if exists "profile_audit_select_super_admin" on public.profile_audit;
create policy "profile_audit_select_super_admin"
  on public.profile_audit for select
  using (public.get_my_role() = 'SUPER_ADMIN');

-- Ni insert ni update ni delete para nadie: la escribe solo el trigger,
-- que corre como security definer. Sin políticas de escritura, RLS niega.
grant select on public.profile_audit to authenticated;


-- ------------------------------------------------------------
-- 6) ÍNDICES
-- ------------------------------------------------------------
-- Postgres crea índice para la llave primaria y para lo único, no para
-- las llaves foráneas. Cada una de estas columnas se usa en un filtro o
-- en un join en todas las pantallas del portal.
create index if not exists cases_client_idx on public.cases (client_id);
create index if not exists cases_lawyer_idx on public.cases (responsible_lawyer_id);
create index if not exists cases_status_idx on public.cases (status);
create index if not exists cases_created_idx on public.cases (created_at desc);
create index if not exists clients_user_idx on public.clients (user_id);

-- Dos clientas con el mismo documento son la misma persona duplicada.
-- Se hace por índice único y no por constraint para poder ignorar los
-- duplicados que ya existan sin tumbar la migración.
create unique index if not exists clients_documento_unico
  on public.clients (identification_type, identification_number);
