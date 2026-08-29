-- ============================================================
-- THEMIA LEGAL — Fase 3: clientes
-- Cópialo completo y pégalo en Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tabla de clientes.
--    Separada de profiles a propósito: un CLIENT es información del
--    negocio (documento, dirección, ciudad); profiles/auth.users es
--    solo el login. No toda clienta tiene necesariamente una cuenta
--    todavía (user_id puede quedar vacío al principio).
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  identification_type text not null default 'CC'
    check (identification_type in ('CC', 'CE', 'PASAPORTE', 'NIT', 'OTRO')),
  identification_number text not null,
  full_name text not null,
  phone text,
  email text,
  address text,
  city text,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.clients is
  'Datos del cliente como negocio (documento, contacto, dirección). Puede o no estar ligado a una cuenta de acceso (user_id).';

-- 2) Seguridad: activar RLS.
alter table public.clients enable row level security;

-- El equipo (SUPER_ADMIN, ADMINISTRATIVA, ABOGADA) puede ver, crear y
-- actualizar clientes — son quienes gestionan los casos.
create policy "clients_select_staff"
  on public.clients for select
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

create policy "clients_insert_staff"
  on public.clients for insert
  with check (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

create policy "clients_update_staff"
  on public.clients for update
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

-- Una clienta con cuenta puede ver su propio registro (para cuando
-- construyamos "mi información" en su portal, más adelante).
create policy "clients_select_own"
  on public.clients for select
  using (auth.uid() = user_id);

-- 3) Permisos base (igual que en la Fase 1, por si tienes desmarcado
--    "Exponer automáticamente nuevas tablas").
grant select, insert, update on public.clients to authenticated;
