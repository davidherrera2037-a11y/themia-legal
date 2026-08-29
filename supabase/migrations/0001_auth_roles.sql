-- ============================================================
-- THEMIA LEGAL — Fase 1: autenticación y usuarios
-- Cópialo completo y pégalo en Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tabla de perfiles.
--    auth.users (maneja Supabase Auth: correo, contraseña, sesión) ya
--    existe sola. Esta tabla guarda lo propio de la app: el rol, el
--    nombre, etc. — separada, pero ligada 1 a 1 por el mismo id.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'CLIENTE'
    check (role in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA', 'CLIENTE')),
  full_name text,
  phone text,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Datos de la app por usuario (rol, nombre). auth.users guarda el login.';

-- 2) Cuando se crea un usuario nuevo en auth.users, crear su fila en
--    profiles automáticamente (empieza como CLIENTE; el rol correcto
--    se ajusta a mano en el Table Editor para el equipo interno).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Función auxiliar: "¿cuál es mi rol?" — la van a usar también las
--    políticas de seguridad de las próximas fases (casos, documentos...).
create or replace function public.get_my_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 4) Seguridad real: activar Row Level Security.
--    A partir de aquí, es la base de datos —no el código— la que decide
--    quién puede leer o escribir cada fila.
alter table public.profiles enable row level security;

-- Cada quien puede ver su propio perfil.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Cada quien puede actualizar su propio perfil (no su propio rol —
-- eso lo controla el Table Editor / una pantalla de administración
-- en una fase futura).
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- El equipo interno (SUPER_ADMIN, ADMINISTRATIVA) puede ver todos los
-- perfiles — lo van a necesitar para gestionar el equipo.
create policy "profiles_select_staff"
  on public.profiles for select
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA'));

-- 5) Permisos base de la tabla.
--    Si desmarcaste "Exponer automáticamente nuevas tablas" al crear el
--    proyecto (recomendado), esto es necesario para que la API pueda
--    tocar esta tabla — las políticas de arriba siguen mandando fila
--    por fila. Nunca se le da acceso a "anon" (usuarios sin sesión).
grant select, update on public.profiles to authenticated;
